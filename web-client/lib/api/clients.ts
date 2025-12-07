import axios, { AxiosError } from "axios";
import type { ApiError } from "@/lib/types";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3000/api";

// Criar instância do Axios
export const apiClient = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const apiError: ApiError = {
      error: error.response?.data?.error || error.message || "An error occurred",
      statusCode: error.response?.status
    };
    
    console.error("[API Error]", apiError);
    return Promise.reject(apiError);
  }
);

// Helper para extrair dados de resposta
export function extractData<T>(response: any): T {
  // A resposta pode vir como { user: {...}, _links: {...} }
  // Precisamos extrair apenas os dados
  const { _links, ...data } = response;
  
  // Se tiver apenas uma chave além de _links, retornar seu valor
  const keys = Object.keys(data);
  if (keys.length === 1) {
    return data[keys[0] as keyof typeof data] as T;
  }
  
  return data as T;
}