// client/src/services/payment.service.js
import api from './api';

export const createPaymentOrder = async (contractId) => {
  const response = await api.post('/payments/create-order', { contractId });
  return response.data;
};

export const verifyPayment = async (data) => {
  const response = await api.post('/payments/verify', data);
  return response.data;
};

export const getClientPayments = async () => {
  const response = await api.get('/payments/client');
  return response.data;
};

export const getFreelancerPayments = async () => {
  const response = await api.get('/payments/freelancer');
  return response.data;
};

export const getAllPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};