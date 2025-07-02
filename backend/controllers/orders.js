const pool = require('../config/database');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { sendEmail, enviarCorreo } = require('../utils/email');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

// Obtener órdenes (admin ve todas, usuario ve las propias)
const getOrders = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const orders = await pool.query(`
        SELECT o.*, u.name as user_name, 
          COALESCE(string_agg(DISTINCT a.name, ', '), '') as artisan_names
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN users a ON p.artisan_id = a.id
        GROUP BY o.id, u.name
        ORDER BY o.created_at DESC
      `);
      return res.json(orders.rows);
    }
    // Si es artesano y se pasa artisan_id, devolver solo pedidos con productos suyos
          if (req.user.role === 'artesano' && (req.query.artisan_id || req.query.artisan_id === req.user.id || req.query.artisan_id === String(req.user.id))) {
      // Buscar pedidos que tengan al menos un producto del artesano
      const ordersRes = await pool.query(`
        SELECT DISTINCT o.*, u.name as user_name FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        JOIN users u ON o.user_id = u.id
        WHERE p.artisan_id = $1
        ORDER BY o.created_at DESC
      `, [req.user.id]);
      const orders = ordersRes.rows;
      // Para cada pedido, incluir solo los ítems del artesano
      for (const order of orders) {
        const itemsRes = await pool.query(
          'SELECT oi.*, p.name, p.stock FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1 AND p.artisan_id = $2',
          [order.id, req.user.id]
        );
        order.items = itemsRes.rows;
      }
      return res.json(orders);
    }
    // Si no es admin ni artesano, solo puede ver sus propias órdenes
    const orders = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(orders.rows);
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las órdenes de un usuario específico (solo admin)
const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso no autorizado.' });
    }

    const orders = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(orders.rows);

  } catch (error) {
    console.error('Error obteniendo las órdenes del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// Obtener una orden específica
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    // JOIN para obtener el nombre del usuario
    const orderRes = await pool.query('SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    const order = orderRes.rows[0];
    
    // Verificar permisos
    if (req.user.role === 'admin' || order.user_id === req.user.id) {
      // Admin o dueño del pedido pueden ver
      return res.json(order);
    }
    
    // Si es artesano, verificar si tiene productos en el pedido
    if (req.user.role === 'artesano') {
      const hasProductsInOrder = await pool.query(
        `SELECT COUNT(*) as count 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = $1 AND p.artisan_id = $2`,
        [id, req.user.id]
      );
      
      if (parseInt(hasProductsInOrder.rows[0].count) > 0) {
        return res.json(order);
      }
    }
    
    // Si no cumple ninguna condición, denegar acceso
    return res.status(403).json({ message: 'No tienes permisos para ver esta orden' });
    
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear una nueva orden
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { items, shipping_address, payment_method } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No hay productos en la orden' });
    }
    // Calcular total
    let total = 0;
    for (const item of items) {
      const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      if (product.rows.length === 0 || product.rows[0].status !== 'active') {
        return res.status(400).json({ message: `Producto no válido o no disponible: ${item.product_id}` });
      }
      if (product.rows[0].stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para: ${product.rows[0].name}` });
      }
      total += parseFloat(product.rows[0].price) * item.quantity;
    }
    // Crear orden
    const newOrder = await pool.query(
      'INSERT INTO orders (user_id, total, shipping_address, payment_method) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, total, shipping_address, payment_method]
    );
    const orderId = newOrder.rows[0].id;
    // Insertar items y actualizar stock
    for (const item of items) {
      const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, product.rows[0].price]
      );
      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    res.status(201).json({ message: 'Orden creada exitosamente', order: newOrder.rows[0] });
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar estado de la orden (solo admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'];
    const statusMap = {
      pending: 'Pendiente',
      paid: 'Pagado',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      in_transit: 'En tránsito',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }
    // Permitir solo si es admin o artesano con productos en el pedido
    if (req.user.role !== 'admin') {
      // Verificar si el pedido tiene productos del artesano
      const itemsRes = await pool.query(
        'SELECT 1 FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1 AND p.artisan_id = $2 LIMIT 1',
        [id, req.user.id]
      );
      if (itemsRes.rows.length === 0) {
        return res.status(403).json({ message: 'No tienes permisos para cambiar el estado de este pedido' });
      }
    }
    // Obtener el estado anterior
    const prevRes = await pool.query('SELECT status, user_id, total, shipping_address, payment_method FROM orders WHERE id = $1', [id]);
    if (prevRes.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    const oldStatus = prevRes.rows[0].status;
    // Validar transición de estado
    const allowedTransitions = {
      pending: ['paid', 'cancelled'],
      paid: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };
    if (status !== oldStatus && !allowedTransitions[oldStatus].includes(status)) {
      return res.status(400).json({ message: `Transición de estado no permitida: ${oldStatus} → ${status}. Solo puedes avanzar al siguiente estado o cancelar antes de entregado.` });
    }
    // Actualizar estado
    const updated = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    // Registrar en historial
    await pool.query(
      'INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)',
      [id, oldStatus, status, req.user.id]
    );
    // Obtener email y nombre del usuario
    const userRes = await pool.query('SELECT email, name FROM users WHERE id = $1', [prevRes.rows[0].user_id]);
    const user = userRes.rows[0];
    // Enviar email de notificación
    if (user && user.email) {
      const html = `
        <h2>¡Hola ${user.name}!</h2>
        <p>El estado de tu pedido <b>#${id}</b> ha cambiado a: <b>${statusMap[status] || status}</b>.</p>
        <ul>
          <li><b>Total:</b> $${parseFloat(prevRes.rows[0].total).toLocaleString('es-CO')} COP</li>
          <li><b>Dirección de envío:</b> ${prevRes.rows[0].shipping_address}</li>
          <li><b>Método de pago:</b> ${prevRes.rows[0].payment_method}</li>
        </ul>
        <p>Puedes ver el detalle y seguimiento de tu pedido en la plataforma.</p>
        <a href="https://artesaniasyco.com/dashboard/orders/${id}" style="display:inline-block;margin-top:12px;padding:10px 18px;background:#f59e42;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Ver mi pedido</a>
        <p style="margin-top:24px;font-size:12px;color:#888;">No respondas a este correo. Cualquier duda, contáctanos desde la plataforma.</p>
      `;
      await enviarCorreo({
        to: user.email,
        subject: `Actualización de estado de tu pedido #${id}`,
        html
      });
    }
    res.json({ message: 'Estado actualizado', order: updated.rows[0] });
  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar una orden (solo admin)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    res.json({ message: 'Orden eliminada', order: deleted.rows[0] });
  } catch (error) {
    console.error('Error eliminando orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear pedido desde checkout (flujo moderno)
const checkoutOrder = async (req, res) => {
  try {
    const { cartItems, shippingAddress, paymentMethod } = req.body;
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'No hay productos en el carrito' });
    }
    if (!shippingAddress || typeof shippingAddress !== 'string') {
      return res.status(400).json({ message: 'Dirección de envío requerida' });
    }
    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return res.status(400).json({ message: 'Método de pago requerido' });
    }
    // Calcular total y validar stock
    let total = 0;
    for (const item of cartItems) {
      const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      if (product.rows.length === 0 || product.rows[0].status !== 'active') {
        return res.status(400).json({ message: `Producto no válido o no disponible: ${item.product_id}` });
      }
      if (product.rows[0].stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para: ${product.rows[0].name}` });
      }
      total += parseFloat(product.rows[0].price) * item.quantity;
    }
    // Crear pedido
    const newOrder = await pool.query(
      'INSERT INTO orders (user_id, total, shipping_address, payment_method, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, total, shippingAddress, paymentMethod, 'pending']
    );
    const orderId = newOrder.rows[0].id;
    // Insertar items y actualizar stock
    for (const item of cartItems) {
      const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, product.rows[0].price]
      );
      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    // Resumen del pedido
    const orderSummary = {
      orderId,
      total,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      items: cartItems
    };
    res.status(201).json({ message: 'Pedido creado exitosamente', order: orderSummary });
  } catch (error) {
    console.error('Error en checkoutOrder:', error);
    res.status(500).json({ message: 'Error interno al crear el pedido' });
  }
};

// Simular pago, generar factura PDF y enviar por email
const payOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Buscar la orden
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    const order = orderRes.rows[0];
    // Solo el dueño o admin puede pagar
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para pagar este pedido' });
    }
    // Simular pago: marcar como pagado
    await pool.query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['paid', orderId]);
    // Obtener items
    const itemsRes = await pool.query('SELECT oi.*, p.name, p.description, c.name as category FROM order_items oi JOIN products p ON oi.product_id = p.id LEFT JOIN categories c ON p.category_id = c.id WHERE oi.order_id = $1', [orderId]);
    const items = itemsRes.rows;
    // Obtener usuario
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
    const user = userRes.rows[0];
    // Generar factura PDF
    const doc = new PDFDocument({ margin: 40 });
    const pdfPath = path.join(__dirname, `../../backend/uploads/invoice-order-${orderId}.pdf`);
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Logo (más grande y bien centrado)
    const logoPath = path.join(__dirname, '../../frontend/public/static/LogoIncial.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 80, 30, { width: 160, align: 'center' });
      doc.moveDown(2.5);
    } else {
      doc.moveDown(1.5);
    }

    // Título
    doc.font('Courier-Bold').fontSize(26).fillColor('#222').text('Factura de Compra', { align: 'center' });
    doc.moveDown(1.2);

    // Info de pedido y usuario
    doc.font('Courier').fontSize(13).fillColor('#333');
    doc.text(`Pedido: #${orderId}`);
    doc.text(`Fecha: ${new Date(order.created_at).toLocaleString()}`);
    doc.text(`Cliente: ${user.name} (${user.email})`);
    doc.text(`Dirección de envío: ${order.shipping_address}`);
    doc.text(`Método de pago: ${order.payment_method}`);
    doc.moveDown(1.2);

    // Tabla de productos
    doc.font('Courier-Bold').fontSize(15).fillColor('#EA580C').text('Productos:', { underline: true });
    doc.moveDown(0.3);
    // Encabezado tabla
    const tableTop = doc.y;
    doc.save();
    doc.roundedRect(40, tableTop, doc.page.width - 80, 18, 6).fill('#6366F1');
    doc.restore();
    doc.font('Courier-Bold').fontSize(10).fillColor('#fff').text('Nombre', 45, tableTop + 3, { width: 100 });
    doc.text('Categoría', 150, tableTop + 3, { width: 70 });
    doc.text('Descripción', 225, tableTop + 3, { width: 120 });
    doc.text('Cantidad', 350, tableTop + 3, { width: 50 });
    doc.text('Precio', 410, tableTop + 3, { width: 70 });
    doc.text('Subtotal', 485, tableTop + 3, { width: 70 });
    let y = tableTop + 18;
    const maxRows = 8;
    items.slice(0, maxRows).forEach((item, idx) => {
      doc.save();
      doc.roundedRect(40, y, doc.page.width - 80, 16, 6).fill(idx % 2 === 0 ? '#F3F4F6' : '#E0E7FF');
      doc.restore();
      doc.fillColor('#EA580C').font('Courier-Bold').fontSize(9);
      doc.text(item.name, 45, y + 2, { width: 100 });
      doc.text(item.category || 'Sin categoría', 150, y + 2, { width: 70 });
      doc.text(item.description || '-', 225, y + 2, { width: 120 });
      doc.text(item.quantity.toString(), 350, y + 2, { width: 50 });
      doc.text(`$${parseFloat(item.price).toLocaleString('es-CO')}`, 410, y + 2, { width: 70 });
      doc.text(`$${(parseFloat(item.price) * item.quantity).toLocaleString('es-CO')}`, 485, y + 2, { width: 70 });
      y += 16;
    });
    if (items.length > maxRows) {
      doc.save();
      doc.roundedRect(40, y, doc.page.width - 80, 16, 6).fill('#FDE68A');
      doc.restore();
      doc.font('Courier-Bold').fontSize(9).fillColor('#EA580C').text(`...y ${items.length - maxRows} productos más`, 45, y + 3, { width: doc.page.width - 100 });
      y += 16;
    }
    doc.y = y + 6;
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#EA580C');
    doc.moveDown(0.2);
    // Total (más grande y notorio)
    doc.save();
    doc.roundedRect(doc.page.width - 260, doc.y, 220, 40, 12).fill('#059669');
    doc.restore();
    doc.font('Courier-Bold').fontSize(22).fillColor('#fff').text(`Total: $${parseFloat(order.total).toLocaleString('es-CO')} COP`, doc.page.width - 250, doc.y + 10, { align: 'left', width: 200 });
    doc.moveDown(1.5);
    // Mensaje bonito y agradecimiento
    doc.save();
    doc.roundedRect(40, doc.y, doc.page.width - 80, 28, 10).fill('#F3F4F6');
    doc.restore();
    doc.font('Courier-Oblique').fontSize(11).fillColor('#EA580C').text('¡Gracias por confiar en el trabajo artesanal colombiano! Cada compra apoya a un artesano y su familia.', 50, doc.y + 6, { align: 'center', width: doc.page.width - 100 });
    doc.moveDown(0.5);
    doc.font('Courier-Oblique').fontSize(10).fillColor('#6366F1').text('Esperamos que disfrutes tu compra. ¡Tu apoyo hace la diferencia!', { align: 'center' });
    doc.moveDown(0.2);
    // Correos de ayuda
    doc.font('Courier').fontSize(11).fillColor('#222').text('¿Necesitas ayuda? Escríbenos a: soporte@artesaniasyco.com o ayuda@artesaniasyco.com', { align: 'center' });
    doc.end();
    // Esperar a que el PDF se escriba
    await new Promise(resolve => stream.on('finish', resolve));
    // No enviar email por ahora. Implementar en el futuro.
    res.json({ message: 'Pago simulado exitoso. La factura está disponible en la sección de pedidos.' });
  } catch (error) {
    console.error('Error en payOrder:', error);
    res.status(500).json({ message: 'Error interno al simular el pago y enviar factura' });
  }
};

// Obtener historial de cambios de estado de un pedido
const getOrderStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const historyRes = await pool.query(
      `SELECT h.*, u.name as user_name, u.role as user_role
       FROM order_status_history h
       LEFT JOIN users u ON h.changed_by = u.id
       WHERE h.order_id = $1
       ORDER BY h.changed_at ASC`,
      [id]
    );
    res.json(historyRes.rows);
  } catch (error) {
    console.error('Error obteniendo historial de estado:', error);
    res.status(500).json({ message: 'Error interno al obtener historial de estado' });
  }
};

// Exportar pedidos a CSV
const exportOrdersCSV = async (req, res) => {
  try {
    const { status, user_id, artisan_id, from, to } = req.query;
    let query = `SELECT o.*, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id`;
    const conditions = [];
    const params = [];
    let idx = 1;
    if (status) { conditions.push(`o.status = $${idx++}`); params.push(status); }
    if (user_id) { conditions.push(`o.user_id = $${idx++}`); params.push(user_id); }
    if (from) { conditions.push(`o.created_at >= $${idx++}`); params.push(from); }
    if (to) { conditions.push(`o.created_at <= $${idx++}`); params.push(to); }
    // Si es artesano, solo pedidos con productos suyos
    if (artisan_id) {
      query += ` JOIN order_items oi ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id`;
      conditions.push(`p.artisan_id = $${idx++}`);
      params.push(artisan_id);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' GROUP BY o.id, u.name ORDER BY o.created_at DESC';
    const ordersRes = await pool.query(query, params);
    const orders = ordersRes.rows;
    if (!orders.length) {
      return res.status(404).json({ message: 'No hay pedidos para exportar' });
    }
    // Obtener productos y artesanos por pedido
    for (const order of orders) {
      const itemsRes = await pool.query(`
        SELECT p.name, p.description, c.name as category, oi.quantity
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE oi.order_id = $1
      `, [order.id]);
      order.productos = itemsRes.rows.map(i => `${i.name} (${i.category || 'Sin categoría'}) x${i.quantity}${i.description ? ' - ' + i.description : ''}`).join('; ');
    }
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Usuario', value: 'user_name' },
      { label: 'Total', value: 'total' },
      { label: 'Estado', value: 'status' },
      { label: 'Dirección', value: 'shipping_address' },
      { label: 'Método de pago', value: 'payment_method' },
      { label: 'Fecha', value: row => new Date(row.created_at).toLocaleString('es-CO') },
      { label: 'Productos', value: 'productos' },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);
    res.header('Content-Type', 'text/csv');
    res.attachment('pedidos.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exportando pedidos a CSV:', error);
    res.status(500).json({ message: 'Error interno al exportar pedidos' });
  }
};

// Exportar pedidos a Excel (XLSX)
const exportOrdersExcel = async (req, res) => {
  try {
    const { status, user_id, artisan_id, from, to } = req.query;
    let query = `SELECT o.*, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id`;
    const conditions = [];
    const params = [];
    let idx = 1;
    if (status) { conditions.push(`o.status = $${idx++}`); params.push(status); }
    if (user_id) { conditions.push(`o.user_id = $${idx++}`); params.push(user_id); }
    if (from) { conditions.push(`o.created_at >= $${idx++}`); params.push(from); }
    if (to) { conditions.push(`o.created_at <= $${idx++}`); params.push(to); }
    if (artisan_id) {
      query += ` JOIN order_items oi ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id`;
      conditions.push(`p.artisan_id = $${idx++}`);
      params.push(artisan_id);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' GROUP BY o.id, u.name ORDER BY o.created_at DESC';
    const ordersRes = await pool.query(query, params);
    const orders = ordersRes.rows;
    if (!orders.length) {
      return res.status(404).json({ message: 'No hay pedidos para exportar' });
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pedidos');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Usuario', key: 'user_name', width: 25 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Dirección', key: 'shipping_address', width: 30 },
      { header: 'Método de pago', key: 'payment_method', width: 20 },
      { header: 'Fecha', key: 'created_at', width: 22 },
    ];
    // Estilo de cabecera
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' } // Indigo-500
    };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).border = {
      bottom: { style: 'thick', color: { argb: 'FF6366F1' } }
    };
    // Agregar filas y bordes
    orders.forEach(order => {
      const row = sheet.addRow({
        ...order,
        created_at: new Date(order.created_at).toLocaleString('es-CO')
      });
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        bottom: { style: 'thin', color: { argb: 'FFB4B4B4' } }
      };
    });
    // Ajustar altura de filas
    sheet.eachRow(row => { row.height = 22; });
    // Bordes de la tabla
    sheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFB4B4B4' } },
          left: { style: 'thin', color: { argb: 'FFB4B4B4' } },
          bottom: { style: 'thin', color: { argb: 'FFB4B4B4' } },
          right: { style: 'thin', color: { argb: 'FFB4B4B4' } },
        };
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pedidos.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando pedidos a Excel:', error);
    res.status(500).json({ message: 'Error interno al exportar pedidos' });
  }
};

// Obtener los ítems de un pedido específico
const getOrderItems = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero verificar que el pedido existe
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    const order = orderRes.rows[0];
    
    // Verificar permisos - similar a getOrder
    let hasPermission = false;
    
    if (req.user.role === 'admin' || order.user_id === req.user.id) {
      hasPermission = true;
    } else if (req.user.role === 'artesano') {
      // Verificar si el artesano tiene productos en este pedido
      const hasProductsInOrder = await pool.query(
        `SELECT COUNT(*) as count 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = $1 AND p.artisan_id = $2`,
        [id, req.user.id]
      );
      
      if (parseInt(hasProductsInOrder.rows[0].count) > 0) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'No tienes permisos para ver los items de esta orden' });
    }
    
    // Si tiene permisos, obtener los items
    const itemsRes = await pool.query(
      'SELECT oi.*, p.name, p.stock, p.description, c.name as category FROM order_items oi JOIN products p ON oi.product_id = p.id LEFT JOIN categories c ON p.category_id = c.id WHERE oi.order_id = $1',
      [id]
    );
    res.json(itemsRes.rows);
  } catch (error) {
    console.error('Error obteniendo items del pedido:', error);
    res.status(500).json({ message: 'Error interno al obtener los items del pedido' });
  }
};

// Generar solo la factura PDF (sin simular pago ni enviar email)
const generateInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener la orden
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    const order = orderRes.rows[0];
    // Permisos: admin o dueño
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para generar la factura de este pedido' });
    }
    // Obtener items
    const itemsRes = await pool.query('SELECT oi.*, p.name, p.description, c.name as category, p.artisan_id FROM order_items oi JOIN products p ON oi.product_id = p.id LEFT JOIN categories c ON p.category_id = c.id WHERE oi.order_id = $1', [id]);
    const items = itemsRes.rows;
    // Obtener usuario
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
    const user = userRes.rows[0];
    // Obtener artesano (si hay solo uno)
    let artisan = null;
    if (items.length === 1) {
      const artisanRes = await pool.query('SELECT * FROM users WHERE id = $1', [items[0].artisan_id]);
      artisan = artisanRes.rows[0];
    }
    // Generar factura PDF (solo una página, diseño compacto)
    const doc = new PDFDocument({ margin: 24, size: 'A4', autoFirstPage: true });
    const pdfPath = path.join(__dirname, `../../backend/uploads/invoice-order-${id}.pdf`);
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Logo
    const logoPath = path.join(__dirname, '../../frontend/public/static/LogoIncial.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 40, 24, { width: 80 });
    }
    // Título
    doc.font('Courier-Bold').fontSize(18).fillColor('#EA580C').text('Factura de Compra', 0, 90, { align: 'center' });
    doc.moveTo(32, 115).lineTo(doc.page.width - 32, 115).stroke('#EA580C');

    // Info pedido y usuario
    doc.font('Courier').fontSize(9).fillColor('#333');
    doc.text(`Pedido: #${id}    Fecha: ${new Date(order.created_at).toLocaleDateString('es-CO')}`, 32, 125);
    doc.text(`Cliente: ${user.name} (${user.email})`);
    doc.text(`Envío: ${order.shipping_address}`);
    doc.text(`Pago: ${order.payment_method}`);
    if (items.length === 1 && items[0].artisan_id) {
      const artisanRes = await pool.query('SELECT * FROM users WHERE id = $1', [items[0].artisan_id]);
      const artisan = artisanRes.rows[0];
      if (artisan) doc.text(`Artesano: ${artisan.name} (${artisan.email})`);
    }
    doc.moveTo(32, doc.y + 4).lineTo(doc.page.width - 32, doc.y + 4).stroke('#E0E7FF');

    // Tabla productos (máx 6)
    doc.font('Courier-Bold').fontSize(10).fillColor('#6366F1').text('Productos:', 32, doc.y + 8);
    const tableY = doc.y + 4;
    doc.font('Courier-Bold').fontSize(8).fillColor('#fff');
    doc.rect(32, tableY, doc.page.width - 64, 13).fill('#6366F1');
    doc.fillColor('#fff').text('Nombre', 36, tableY + 2, { width: 70 });
    doc.text('Cat.', 110, tableY + 2, { width: 35 });
    doc.text('Desc.', 148, tableY + 2, { width: 70 });
    doc.text('Cant.', 222, tableY + 2, { width: 25 });
    doc.text('Precio', 252, tableY + 2, { width: 40 });
    doc.text('Subtotal', 296, tableY + 2, { width: 50 });
    let y = tableY + 13;
    const maxRows = 6;
    items.slice(0, maxRows).forEach((item, idx) => {
      doc.save();
      doc.rect(32, y, doc.page.width - 64, 12).fill(idx % 2 === 0 ? '#F3F4F6' : '#E0E7FF');
      doc.restore();
      doc.font('Courier').fontSize(7).fillColor('#EA580C');
      doc.text(item.name.slice(0, 14), 36, y + 2, { width: 70 });
      doc.text((item.category || '').slice(0, 10), 110, y + 2, { width: 35 });
      doc.text((item.description || '-').slice(0, 18), 148, y + 2, { width: 70 });
      doc.text(item.quantity.toString(), 222, y + 2, { width: 25 });
      doc.text(`$${parseFloat(item.price).toLocaleString('es-CO')}`, 252, y + 2, { width: 40 });
      doc.text(`$${(parseFloat(item.price) * item.quantity).toLocaleString('es-CO')}`, 296, y + 2, { width: 50 });
      y += 12;
    });
    if (items.length > maxRows) {
      doc.save();
      doc.rect(32, y, doc.page.width - 64, 12).fill('#FDE68A');
      doc.restore();
      doc.font('Courier-Bold').fontSize(7).fillColor('#EA580C').text(`...y ${items.length - maxRows} productos más`, 36, y + 2, { width: doc.page.width - 100 });
      y += 12;
    }
    doc.y = y + 4;
    doc.moveTo(32, doc.y).lineTo(doc.page.width - 32, doc.y).stroke('#EA580C');

    // Total
    doc.font('Courier-Bold').fontSize(11).fillColor('#059669').text(`Total: $${parseFloat(order.total).toLocaleString('es-CO')} COP`, doc.page.width - 180, doc.y + 6, { width: 170, align: 'right' });

    // Mensaje agradecimiento
    doc.font('Courier-Oblique').fontSize(8).fillColor('#EA580C').text('¡Gracias por confiar en el trabajo artesanal colombiano!', 32, doc.y + 18, { width: doc.page.width - 64, align: 'center' });
    doc.font('Courier-Oblique').fontSize(7).fillColor('#6366F1').text('Tu apoyo hace la diferencia.', 32, doc.y + 28, { width: doc.page.width - 64, align: 'center' });

    // Pie de página compacto (posición absoluta, nunca fuerza salto)
    const footerY = doc.page.height - 48;
    doc.save();
    doc.rect(32, footerY, doc.page.width - 64, 24).fill('#FFF7ED');
    doc.restore();
    doc.font('Courier-Bold').fontSize(8).fillColor('#EA580C').text('¿Ayuda? soporte@artesaniasyco.com | ayuda@artesaniasyco.com | somos@artesaniasyco.com', 32, footerY + 6, { width: doc.page.width - 64, align: 'center', lineBreak: false });
    doc.font('Courier-Oblique').fontSize(7).fillColor('#888').text('Artesanías&Co - Apoyando el arte colombiano.', 32, footerY + 16, { width: doc.page.width - 64, align: 'center', lineBreak: false });

    doc.end();
    await new Promise(resolve => stream.on('finish', resolve));
    res.json({ message: 'Factura generada exitosamente', pdf: `/uploads/invoice-order-${id}.pdf` });
  } catch (error) {
    console.error('Error generando factura PDF:', error);
    res.status(500).json({ message: 'Error interno al generar la factura' });
  }
};

// Descargar factura PDF
const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la orden existe
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    const order = orderResult.rows[0];
    
    // Verificar permisos
    let hasPermission = false;
    
    if (req.user.role === 'admin' || order.user_id === req.user.id) {
      hasPermission = true;
    } else if (req.user.role === 'artesano') {
      // Verificar si el artesano tiene productos en este pedido
      const hasProductsInOrder = await pool.query(
        `SELECT COUNT(*) as count 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = $1 AND p.artisan_id = $2`,
        [id, req.user.id]
      );
      
      if (parseInt(hasProductsInOrder.rows[0].count) > 0) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'No tienes permisos para descargar esta factura' });
    }
    
    // Verificar que el pedido esté en un estado que permita descargar factura
    const allowedStatuses = ['paid', 'confirmed', 'shipped', 'in_transit', 'delivered'];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({ message: 'La factura no está disponible para este pedido aún' });
    }
    
    // Construir la ruta del archivo PDF
    const pdfPath = path.join(__dirname, '../uploads', `invoice-order-${id}.pdf`);
    
    // Verificar si el archivo existe
    const fs = require('fs').promises;
    try {
      await fs.access(pdfPath);
    } catch (error) {
      // Si no existe, intentar generarlo
      await generateInvoiceForOrder(id);
    }
    
    // Enviar el archivo
    res.download(pdfPath, `factura-orden-${id}.pdf`, (err) => {
      if (err) {
        console.error('Error enviando factura:', err);
        res.status(500).json({ message: 'Error al descargar la factura' });
      }
    });
    
  } catch (error) {
    console.error('Error en downloadInvoice:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Función auxiliar para generar factura si no existe
const generateInvoiceForOrder = async (orderId) => {
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = orderResult.rows[0];
  
  const itemsResult = await pool.query(
    `SELECT oi.*, p.name as product_name 
     FROM order_items oi 
     JOIN products p ON oi.product_id = p.id 
     WHERE oi.order_id = $1`,
    [orderId]
  );
  
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
  const user = userResult.rows[0];
  
  // Generar factura PDF
  const doc = new PDFDocument({ size: 'letter', margin: 50 });
  const pdfPath = path.join(__dirname, '../uploads', `invoice-order-${orderId}.pdf`);
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);
  
  // Header con logo
  doc.font('Courier-Bold').fontSize(18).fillColor('#EA580C').text('Factura de Compra', 0, 90, { align: 'center' });
  doc.fontSize(28).fillColor('#0F172A').text('Artesanías & Co', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor('#64748B').text('Conectando arte y tradición', { align: 'center' });
  
  // Información de la orden
  doc.moveDown(2);
  doc.fontSize(11).fillColor('#0F172A');
  doc.text(`Orden: #${orderId}`, 50, doc.y);
  doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-CO')}`, 50, doc.y + 15);
  doc.text(`Cliente: ${user.name}`, 50, doc.y + 15);
  doc.text(`Email: ${user.email}`, 50, doc.y + 15);
  
  // Productos
  doc.moveDown(2);
  doc.font('Helvetica-Bold').text('Productos:', 50);
  doc.moveDown(0.5);
  
  let yPosition = doc.y;
  itemsResult.rows.forEach(item => {
    doc.font('Helvetica').fontSize(10);
    doc.text(`${item.product_name || 'Producto'}`, 60, yPosition);
    doc.text(`x${item.quantity}`, 350, yPosition);
    doc.text(`$${parseFloat(item.price).toLocaleString('es-CO')} COP`, 420, yPosition, { align: 'right' });
    yPosition += 20;
  });
  
  // Total
  doc.moveDown(2);
  doc.font('Helvetica-Bold').fontSize(12);
  doc.text(`Total: $${parseFloat(order.total).toLocaleString('es-CO')} COP`, 50, doc.y, { align: 'right' });
  
  // Footer
  doc.moveDown(3);
  doc.font('Helvetica').fontSize(9).fillColor('#64748B');
  doc.text('Gracias por tu compra. Esta factura es válida como comprobante.', { align: 'center' });
  doc.text('Artesanías & Co - NIT: 900.123.456-7', { align: 'center' });
  
  doc.end();
  
  // Esperar a que se termine de escribir el archivo
  await new Promise((resolve) => stream.on('finish', resolve));
};

module.exports = {
  getOrders,
  getOrdersByUserId,
  getOrder,
  getOrderItems,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  checkoutOrder,
  exportOrdersCSV,
  exportOrdersExcel,
  payOrder,
  generateInvoicePDF,
  downloadInvoice,
  getOrderStatusHistory
}; 