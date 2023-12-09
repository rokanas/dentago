// This is taken from the template in DIT342 Web and Mobile Development and adapted slightly for this project

import axios from 'axios';

export const Api = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api'
});