"use strict";
exports.id = 250;
exports.ids = [250];
exports.modules = {

/***/ 9250:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ CartProvider),
/* harmony export */   "j": () => (/* binding */ useCart)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9941);
/* harmony import */ var _AuthContext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8506);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_utils_api__WEBPACK_IMPORTED_MODULE_2__, _AuthContext__WEBPACK_IMPORTED_MODULE_3__]);
([_utils_api__WEBPACK_IMPORTED_MODULE_2__, _AuthContext__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);




const CartContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();
const useCart = ()=>{
    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(CartContext);
    if (!context) {
        throw new Error("useCart debe ser usado dentro de CartProvider");
    }
    return context;
};
const CartProvider = ({ children  })=>{
    const [cartItems, setCartItems] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const { user , isAuthenticated  } = (0,_AuthContext__WEBPACK_IMPORTED_MODULE_3__/* .useAuth */ .a)();
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        if (isAuthenticated) {
            fetchCartItems();
        } else {
            setCartItems([]);
        }
    }, [
        isAuthenticated
    ]);
    const fetchCartItems = async ()=>{
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const response = await _utils_api__WEBPACK_IMPORTED_MODULE_2__/* ["default"].get */ .Z.get("/api/cart");
            setCartItems(response.data);
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally{
            setLoading(false);
        }
    };
    const addToCart = async (productId, quantity = 1)=>{
        if (!isAuthenticated) {
            throw new Error("Debes iniciar sesi\xf3n para agregar productos al carrito");
        }
        try {
            const response = await _utils_api__WEBPACK_IMPORTED_MODULE_2__/* ["default"].post */ .Z.post("/api/cart", {
                productId,
                quantity
            });
            await fetchCartItems();
            return {
                success: true,
                message: "Producto agregado al carrito"
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error al agregar al carrito"
            };
        }
    };
    const updateCartItem = async (productId, quantity)=>{
        try {
            await _utils_api__WEBPACK_IMPORTED_MODULE_2__/* ["default"].put */ .Z.put(`/api/cart/${productId}`, {
                quantity
            });
            await fetchCartItems();
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error al actualizar carrito"
            };
        }
    };
    const removeFromCart = async (productId)=>{
        try {
            await _utils_api__WEBPACK_IMPORTED_MODULE_2__/* ["default"]["delete"] */ .Z["delete"](`/api/cart/${productId}`);
            await fetchCartItems();
            return {
                success: true,
                message: "Producto eliminado del carrito"
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error al eliminar del carrito"
            };
        }
    };
    const clearCart = async ()=>{
        try {
            await _utils_api__WEBPACK_IMPORTED_MODULE_2__/* ["default"]["delete"] */ .Z["delete"]("/api/cart");
            setCartItems([]);
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false
            };
        }
    };
    const getCartTotal = ()=>{
        return cartItems.reduce((total, item)=>total + item.price * item.quantity, 0);
    };
    const getCartItemsCount = ()=>{
        return cartItems.reduce((total, item)=>total + item.quantity, 0);
    };
    const value = {
        cartItems,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        fetchCartItems
    };
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(CartContext.Provider, {
        value: value,
        children: children
    });
};

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;