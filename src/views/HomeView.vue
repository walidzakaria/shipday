<template>
  <main>
    <h1>Shipping Loader</h1>
    <div class="row">
      <div class="col-xl-6 col-lg-6 col-md-10 col-sm-11 col-xs-12">
        <textarea cols="30" rows="10" v-model="extractedText" class="form-control mt-3"></textarea>
        <button class="btn btn-success mt-2" @click="parseInfo">Extract Info</button>
      </div>
      <div class="col-xl-6 col-lg-6 col-md-10 col-sm-11 col-xs-12">
        <form class="form p-4 m-3">
          <div class="form-group mb-4">
            <label for="order-no">Order No.</label>
            <input type="text" class="form-control m-2 mb-3" id="order-no" v-model="info.reference">

            <label for="guest-name">Customer Name:</label>
            <input type="text" class="form-control m-2 mb-3" id="guest-name" v-model="info.guest.name">

            <label for="guest-address">Customer Address:</label>
            <input type="text" class="form-control m-2 mb-3" id="guest-address" v-model="info.guest.address">

            <label for="guest-phone">Customer phone:</label>
            <input type="text" class="form-control m-2 mb-3" id="guest-phone" v-model="info.guest.phone">

            <br>

            <label for="restaurant-name">Restaurant Name:</label>
            <input type="text" class="form-control m-2 mb-3" id="restaurant-name" v-model="info.restaurant.name">

            <label for="restaurant-address">Restaurant Address:</label>
            <input type="text" class="form-control m-2 mb-3" id="restaurant-address" v-model="info.restaurant.address">

            <label for="restaurant-phone">Restaurant phone:</label>
            <input type="text" class="form-control m-2 mb-3" id="restaurant-phone" v-model="info.restaurant.phone">

            <br>

            <label for="delivery-date">Delivery date:</label>
            <input type="text" class="form-control m-2 mb-3" id="delivery-date" v-model="info.deliveryDate">
            
            <label for="pickup-time">Pickup time:</label>
            <input type="text" class="form-control m-2 mb-3" id="pickup-time" v-model="info.pickupTime">

            <label for="expected-pickup-time">Desired pickup time:</label>
            <input type="text" class="form-control m-2 mb-3" id="expected-pickup-time" v-model="info.expectedPickup">

            
            <label for="amount">Amount:</label>
            <input type="number" class="form-control m-2 mb-3" id="amount" v-model="info.totalValue">

            <label for="paid">Paid:</label>
            <select class="form-control m-2 mb-3" id="paid" v-model="info.paid">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>

            <label for="remarks">Remarks:</label>
            <textarea class="form-control m-2 mb-3" id="remarks" v-model="info.remarks" />
          </div>

          <button class="btn btn-success" type="submit" :disabled="loading" @click="sendRequest">
            Send Request <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span class="visually-hidden">Loading...</span>
          </button>
        </form>
      </div>
    </div>
  </main>
</template>


<script>
  // import PDFJSLib from 'pdfjs-dist';
  // import { useOrderStore } from '../stores/orders';
  import Shipday from 'shipday/integration';
  import OrderInfoRequest from 'shipday/integration/order/request/order.info.request';
  import PaymentMethod from 'shipday/integration/order/types/payment.method';
  // import CardType from 'shipday/integration/order/types/card.type';
  // import OrderItem from 'shipday/integration/order/request/order.item';
  //import pdfjsLib from 'pdfjs-dist';


  export default {
    setup() {
      // const orderStore = useOrderStore();
      // const getSkills = orderStore.getSkills;
      // const testSkills = () => orderStore.testSkills();
      // const fetchUsers = () => orderStore.fetchUsers();

      // return {
      //   getSkills,
      //   testSkills,
      //   fetchUsers,
      // };
    },
    data() {
      return {
        loading: false,
        extractedText: '',
        info: {
          reference: '',
          guest: {
            name: '',
            address: '',
            phone: '',
          },
          restaurant: {
            name: '',
            address: '',
            phone: '',
          },
          deliveryDate: '',
          pickupTime: '',
          deliveryTime: '',
          totalValue: null,
          paid: false,
          remarks: '',
        },
      };
    },
    methods: {
      parseInfo() {
        const info = this.extractedText.trim();
        const restaurantName = info.substring(0, info.indexOf(',')).trim();
        const restaurantAddress = info.substring(info.indexOf(',') + 1, info.indexOf(', Tel')).trim().replaceAll('\n', ', ').replaceAll(',,', ',');
        const sections = info.split('_______________________________');
        let restaurantPhone = sections[0].substring(sections[0].indexOf('Tel.:') + 6);
        restaurantPhone = restaurantPhone.substring(0, restaurantPhone.indexOf('\n'));
        const reference = sections[0].split('\n')[3];
        const deliveryDateTime = sections[0].split('\n')[4];
        const deliveryDate = deliveryDateTime.split(' ')[0].replaceAll('/', '-');
        // const issueTime = `${deliveryDateTime.split(' ')[1]}:00`;
        const totalValue = sections[3].replace('Gesamt ', '').replaceAll('\n', '').replaceAll('EUR', '');
        let remarks = '';
        if (info.includes('Anmerkungen')) {
          remarks = info.substring(info.indexOf('Anmerkungen:') + 12);
          remarks = remarks.substring(0, remarks.indexOf('__')).trim().replaceAll('\n', ' ');
        }
        const guestSection = sections[1].trim().split('\n');
        const guestName = guestSection[guestSection.length - 4];
        const guestAddress = `${guestSection[guestSection.length - 3]}, ${guestSection[guestSection.length - 2]}`;
        const guestPhone = guestSection[guestSection.length - 1].replace('Tel.:', '');

        const pickupRegex = /Bestätigte Uhrzeit\W*(\d{2}:\d{2})/;
        const pickupMatch = info.match(pickupRegex);
        const pickupTime = pickupMatch ? `${pickupMatch[1]}:00` : '';

        const expectedPickupRegex = /Gewünschte \w+\W*(\d{2}:\d{2})/;
        const expectedPickupMatch = info.match(expectedPickupRegex);
        const expectedPickup = expectedPickupMatch ? `${expectedPickupMatch[1]}:00` : '';

        this.info.restaurant.name = restaurantName;
        this.info.restaurant.address = restaurantAddress;
        this.info.restaurant.phone = restaurantPhone;
        this.info.reference = reference;
        this.info.deliveryDate = deliveryDate;
        this.info.pickupTime = pickupTime;
        this.info.expectedPickup = expectedPickup;
        this.info.totalValue = parseFloat(totalValue);
        this.info.paid = info.includes('Payment Online');
        this.info.remarks = remarks;
        this.info.guest.name = guestName;
        this.info.guest.address = guestAddress;
        this.info.guest.phone = guestPhone;
      },
      sendRequest() {
        this.loading = true;
        // my token
        // const shipdayClient = new Shipday('6qyxRrWNFI.gilb3OXDv8gUAfGpaVF9', 10000);
        const shipdayClient = new Shipday('L4bQFSIvBZ.8Ye6y6plnJ1nlYdke2ap', 10000);
        
        shipdayClient.carrierService.getCarriers().then(r => console.log(r[0]));
        
        const orderInfoRequest = new OrderInfoRequest(
          this.info.reference,
          this.info.guest.name,
          this.info.guest.address,
          "no mail",
          this.info.guest.phone,
          this.info.restaurant.name,
          this.info.restaurant.address,
        );

        orderInfoRequest.setRestaurantPhoneNumber(this.info.restaurant.phone);
        orderInfoRequest.setExpectedDeliveryDate(this.info.deliveryDate);
        if (this.info.pickupTime !== '') {
          orderInfoRequest.setExpectedDeliveryTime(this.parseTime(this.info.pickupTime));
        }
        if (this.info.expectedPickup !== '') {
          orderInfoRequest.setExpectedPickupTime(this.parseTime(this.info.expectedPickup));
        }
        //orderInfoRequest.setPickupLatLong(41.53867, -72.0827);
        //orderInfoRequest.setDeliveryLatLong(41.53867, -72.0827);
        // orderInfoRequest.setTips(0);
        // orderInfoRequest.setTax(0);
        // orderInfoRequest.setDiscountAmount(0);
        // orderInfoRequest.setDeliveryFee(0);
        orderInfoRequest.setTotalOrderCost(this.info.totalValue);
        if (this.info.remarks !== '') orderInfoRequest.setDeliveryInstruction(this.info.remarks);
        orderInfoRequest.setOrderSource("Seamless");
        // orderInfoRequest.setAdditionalId("4532");
        // orderInfoRequest.setClientRestaurantId(12);

        const paymentOption = this.info.paid ? PaymentMethod.CREDIT_CARD : PaymentMethod.CASH;
        // const paymentOption2 = PaymentMethod.CASH;
        // const cardType = CardType.AMEX;

        orderInfoRequest.setPaymentMethod(paymentOption);
        // orderInfoRequest.setCreditCardType(cardType);
        shipdayClient.orderService
          .insertOrder(orderInfoRequest)
          .then((res) => {
            console.log(res);
            this.loading = false;
          })
          .catch((e) => {
            console.log(e);
            this.loading = false;
          });
        // shipdayClient.orderService.insertOrder(newRequest).then((r) => {
        //   console.log(r);
        // });
      },
      // previewPdf(event) {
      //   const pdfFile = event.target.files[0];
      //   if (pdfFile) {
      //     const reader = new FileReader();
      //     reader.onload = (e) => {
      //       this.$refs.pdfPreview.src = e.target.result;
      //     };
      //     reader.readAsDataURL(pdfFile);
      //   }
      // },
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
      parseTime(inputTime) {
      const d = new Date();
      const timeParts = inputTime.split(':');
      d.setHours(timeParts[0]);
      d.setMinutes(timeParts[1]);
      d.setSeconds(0);
      d.setMilliseconds(0);
      return d.toUTCString().split(' ')[4];
    },
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
  
  form {
    border: 1px solid rgb(206, 206, 206);
    border-radius: 20px;
    -webkit-box-shadow: 11px 10px 14px -7px rgba(0,0,0,0.75);
    -moz-box-shadow: 11px 10px 14px -7px rgba(0,0,0,0.75);
    box-shadow: 11px 10px 14px -7px rgba(0,0,0,0.75);
  }

  .row>div {
    margin-left: auto;
    margin-right: auto;
  }
</style>
