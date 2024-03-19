<template>
  <main>
    <h1>Shipping Loader</h1>
    <div class="row">
      <div class="col col-6">
        <input type="file" class="form-control" id="load-file" accept="application/pdf" @change="previewPdf">
        <button id="post-test" class="btn btn-success btn-sm ml-3" @click="fetchUsers">Test</button>
        <div id="output">
          <div id="intro">
            Extracting text from a PDF file using only Javascript.<br />Tested in
            Chrome 16 and Firefox 9.
          </div>
        </div>
      </div>

      <div class="col col-6">
        <!-- the PDF file must be on the same domain as this page -->
        <iframe id="pdfPreview" ref="pdfPreview"></iframe>
      </div>
    </div>
    {{ getSkills }}
    <button @click="test">Shipday</button>
  </main>
</template>


<script>
  // import PDFJSLib from 'pdfjs-dist';
  import { useOrderStore } from '../stores/orders';
  import Shipday from 'shipday/integration';
  import OrderInfoRequest from 'shipday/integration/order/request/order.info.request';
  import PaymentMethod from 'shipday/integration/order/types/payment.method';
  // import CardType from 'shipday/integration/order/types/card.type';
  // import OrderItem from 'shipday/integration/order/request/order.item';
  //import pdfjsLib from 'pdfjs-dist';  


  export default {
    setup() {
      const orderStore = useOrderStore();
      const getSkills = orderStore.getSkills;
      const testSkills = () => orderStore.testSkills();
      const fetchUsers = () => orderStore.fetchUsers();

      return {
        getSkills,
        testSkills,
        fetchUsers,
      };
    },
    data() {
      return {
        pdfUrl: '',
        pdfLoaded: false,
        extractedText: '',
      };
    },
    methods: {
      test() {
        const shipdayClient = new Shipday('6qyxRrWNFI.gilb3OXDv8gUAfGpaVF9', 10000);
        shipdayClient.carrierService.getCarriers().then(r => console.log(r[0]));
        
        const orderInfoRequest = new OrderInfoRequest(
          "99qT5A",
          "Mr. Jhon Mason",
          "556 Crestlake Dr, San Francisco, CA 94132, USA",
          "jhonMason@gmail.com",
          "+14152392212",
          "Popeyes Louisiana Kitchen",
          "890 Geneva Ave, San Francisco, CA 94112, United States"
        );

        orderInfoRequest.setRestaurantPhoneNumber("+14152392013");
        orderInfoRequest.setExpectedDeliveryDate("2021-06-03");
        orderInfoRequest.setExpectedDeliveryTime("17:45:00");
        orderInfoRequest.setExpectedPickupTime("19:22:00");
        orderInfoRequest.setPickupLatLong(41.53867, -72.0827);
        orderInfoRequest.setDeliveryLatLong(41.53867, -72.0827);
        // orderInfoRequest.setTips(0);
        // orderInfoRequest.setTax(0);
        // orderInfoRequest.setDiscountAmount(0);
        // orderInfoRequest.setDeliveryFee(0);
        orderInfoRequest.setTotalOrderCost(32.47);
        orderInfoRequest.setDeliveryInstruction("Please leave the items by the door");
        orderInfoRequest.setOrderSource("Seamless");
        orderInfoRequest.setAdditionalId("4532");
        orderInfoRequest.setClientRestaurantId(12);

        const paymentOption = PaymentMethod.CREDIT_CARD;
        // const paymentOption2 = PaymentMethod.CASH;
        // const cardType = CardType.AMEX;

        orderInfoRequest.setPaymentMethod(paymentOption);
        // orderInfoRequest.setCreditCardType(cardType);
        shipdayClient.orderService
          .insertOrder(orderInfoRequest)
          .then((res) => console.log(res))
          .catch((e) => console.log(e));
        // shipdayClient.orderService.insertOrder(newRequest).then((r) => {
        //   console.log(r);
        // });
      },
      previewPdf(event) {
        const pdfFile = event.target.files[0];
        if (pdfFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.$refs.pdfPreview.src = e.target.result;
          };
          reader.readAsDataURL(pdfFile);
        }
      },
      // loadPdf() {
      //   try {
      //     const pdfDoc = PDFJSLib.getDocument(this.pdfUrl).then(() => {
      //       const firstPage = pdfDoc.getPage(1).then(() => {
      //         const textContent = firstPage.getTextContent().then(() => {
      //           this.extractedText = textContent.items.map((item) => item.str).join('\n');
      //         });
      //       });
      //     });
      //   } catch (error) {
      //     console.error('Error loading PDF:', error);
      //   }
      // },
    },
  };
</script>

<style>
  html,
  body {
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
      sans-serif;
    width: 100%;
    height: 100%;
    overflow-y: hidden;
    padding: 0;
    margin: 0;
  }
  body {
    font: 13px Helvetica, sans-serif;
  }
  main {
    width: 100%;
    min-height: 100vh;
  }
  .row {
    min-height: 100vh;
  }
  body > div {
    width: 48%;
    height: 100%;
    overflow-y: auto;
    display: inline-block;
    vertical-align: top;
  }
  iframe {
    border: none;
    width: 100%;
    height: 100%;
  }
  #output {
    padding: 10px;
    box-shadow: 0 0 5px #777;
    border-radius: 5px;
    margin: 10px;
  }
  #processor {
    height: 70px;
  }
</style>
