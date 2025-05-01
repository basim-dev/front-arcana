import "../styles/globals.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NotificationToast from "../components/NotificationToast";
import { ToastContainer } from "react-toastify";
import { Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Arcana</title>
        <meta name="description" content="Arcana" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Header />
          <NotificationToast />
          <Component {...pageProps} />
          <Footer />
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Bounce}
            style={{ top: "80px" }}
          />
        </PersistGate>
      </Provider>
    </>
  );
}

export default MyApp;
