"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { getImageUrl } from '@/utils/imageUrl';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(3);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/blogs/categories");
        setCategories(data);
      } catch (error) {
        toast.error("No se pudieron cargar las categorías");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = { page, limit, search };
        if (categoryId) params.category_id = categoryId;
        const { data } = await api.get("/blogs", { params });
        if (page === 1) {
          setBlogs(data.blogs);
        } else {
          setBlogs(prev => [...prev, ...data.blogs]);
        }
        setPagination(data.pagination);
      } catch (error) {
        toast.error("No se pudieron cargar los blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [page, search, categoryId, limit]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategory = (e) => {
    setCategoryId(e.target.value);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-4xl font-bold font-pacifico leading-[1.5] pb-4 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent mb-8">Blogs.</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar blogs..."
          value={search}
          onChange={handleSearch}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
        />
        <select
          value={categoryId}
          onChange={handleCategory}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No se encontraron blogs.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.id}`} className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden">
              {blog.image_url_1 && (
                <img src={getImageUrl(blog.image_url_1)} alt={blog.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-orange-700 line-clamp-2">{blog.title}</h2>
                <div className="flex items-center gap-2 mb-2">
                  {blog.author_avatar && <img src={getImageUrl(blog.author_avatar)} alt="avatar" className="w-7 h-7 rounded-full" />}
                  <span className="text-sm font-semibold text-gray-700">{blog.author_name}</span>
                  <span className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  {blog.categories && blog.categories.map((cat, i) => (
                    <span key={i} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">{cat}</span>
                  ))}
                </div>
                <p className="text-gray-600 line-clamp-3 mb-2">{blog.content}</p>
                <span className="text-orange-600 font-bold text-sm">Ver más</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {/* Botón Ver más */}
      {pagination.page < pagination.pages && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              'Ver más'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogListPage; 