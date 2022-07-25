/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51LNZckL3jckCLx9IkZ7xFrUY6DGq3Sp0JDJz8JAoOXD9GrNCpVKdc53DvjGdukeDCWygUNfiMRUqdAxcSUyHOb4y0019o75GC1'
    );

    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    console.log(session);
    // 2) Create checkout form + charge credit card
    //-- NOT WORKING
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
    //-- SOLUTION
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
