import axios from "axios";

const CHECKOUT_API =
  "http://localhost:5000/api/checkout";

const PAYMENT_API =
  "http://localhost:5000/api/payment";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const prepareCheckout = async (
  token,
  addressId,
  couponCode = ""
) => {
  const response = await axios.post(
    `${CHECKOUT_API}/prepare`,
    {
      addressId,
      couponCode,
    },
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

export const createRazorpayOrder = async (
  token,
  addressId,
  couponCode = ""
) => {
  const response = await axios.post(
    `${CHECKOUT_API}/razorpay/order`,
    {
      addressId,
      couponCode,
    },
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

export const placeCODOrder = async (
  token,
  addressId,
  couponCode = ""
) => {
  const response = await axios.post(
    `${CHECKOUT_API}/cod`,
    {
      addressId,
      couponCode,
    },
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

export const verifyRazorpayPayment =
  async (
    token,
    paymentData
  ) => {
    const response = await axios.post(
      `${PAYMENT_API}/razorpay/verify`,
      paymentData,
      {
        headers: getAuthHeaders(token),
      }
    );

    return response.data;
  };