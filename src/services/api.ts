import axios from 'axios';
import config from '../app/config/config';

const http = axios.create({ baseURL: config.API_URL });

export const contactAPI = {
  sendMessage: (payload: Record<string, any>) => http.post('/contact', payload),
  subscribeNewsletter: (email: string) => http.post('/newsletter', { email }),
};

export default http;