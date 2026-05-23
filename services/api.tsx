const BASE_URL = "http://http://127.0.0.1:8000";

export const getAppConfig = (appId: string) =>
  fetch(`${BASE_URL}/app-config?app_id=${appId}`).then((res) => res.json());

export const getCategories = (appId: string) =>
  fetch(`${BASE_URL}/categories?app_id=${appId}`).then((res) => res.json());

export const getProducts = (appId: string, categoryId?: string) =>
  fetch(
    `${BASE_URL}/products?app_id=${appId}&category=${categoryId || ""}`,
  ).then((res) => res.json());
