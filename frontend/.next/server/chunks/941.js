"use strict";
exports.id = 941;
exports.ids = [941];
exports.modules = {

/***/ 9941:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9648);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([axios__WEBPACK_IMPORTED_MODULE_0__]);
axios__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

const API_URL = "https://artesaniasyco.com/api" || 0;
const api = axios__WEBPACK_IMPORTED_MODULE_0__["default"].create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});
// Interceptor para agregar token
api.interceptors.request.use((config)=>{
    if (false) {}
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Interceptor para manejar errores
api.interceptors.response.use((response)=>response, (error)=>{
    if (error.response?.status === 401) {
        if (false) {}
    }
    return Promise.reject(error);
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (api);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;