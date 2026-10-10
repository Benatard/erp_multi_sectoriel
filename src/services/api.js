import axios from 'axios';
import config from '../app/config/config';

const http = axios.create({ baseURL: config.API_URL });

export const contactAPI = {
  sendMessage: (payload) => http.post('/contact', payload),
  subscribeNewsletter: (email) => http.post('/newsletter', { email }),
};

export default http;
