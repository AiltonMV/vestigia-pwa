/** `true` si el objeto de errores por campo trae al menos uno. */
export const tieneErrores = (errores: object) => Object.keys(errores).length > 0;
