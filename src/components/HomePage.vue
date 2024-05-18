<template>
  <main>
    <h1>Clown Fish</h1>
    <input type="file" @change="handleFileSelect" accept=".txt" hidden ref="fileInput"/>
    <div class="row">
      <div class="col-xl-6 col-lg-6 col-md-10 col-sm-11 col-xs-12">
        <textarea cols="30" rows="10" v-model="extractedText" class="form-control mt-3" ref="extractedText"></textarea>
        <button class="btn btn-success mt-2 mr-2" @click="parseInfo">Extract Info</button>
        <button class="btn btn-warning mt-2 ml-2" @click="reset">Reset</button>
      </div>
      <div class="col-xl-6 col-lg-6 col-md-10 col-sm-11 col-xs-12">
        <form class="form p-4 m-3">
          <button @click="loadRestaurants" class="btn btn-success" type="button">&#11014;</button>
          <select class="form-control m-2 mb-3" v-model="selectedRestaurant">
            <option value="">--Select--</option>
            <option v-for="(i, index) in restaurantOptions" :key="index" :value="i.restaurant">
              {{ i.restaurant }}
            </option>
          </select>
          <div class="form-group mb-4">
              <label for="order-no">Order No.</label>
              <input type="text" class="form-control m-2 mb-3" id="order-no" v-model="info.reference">

              <label for="guest-name">Customer Name:</label>
              <input type="text" class="form-control m-2 mb-3" id="guest-name" v-model="info.guest.name">

              <label for="guest-address">Customer Address:</label>
              <input type="text" class="form-control m-2 mb-3" id="guest-address" v-model="info.guest.address">

              <label for="guest-phone">Customer phone:</label>
              <input type="text" class="form-control m-2 mb-3" id="guest-phone" v-model="info.guest.phone">
            </div>
            <div class="form-group mb-4 row">
              <div class="col-6">
                <label for="pickup-time">Req. delivery time:</label>
                <input type="time" class="form-control m-2 mb-3" id="pickup-time" v-model="info.pickupTime">
              </div>
              <div class="col-6">
                <label for="expected-pickup-time">Req. pickup time:</label>
                <input type="time" class="form-control m-2 mb-3" id="expected-pickup-time" v-model="info.expectedPickup">
              </div>
            </div>
            <div class="form-group mb-4 row">
              <div class="col-8">
                <label for="amount">Amount:</label>
                <input type="number" class="form-control m-2 mb-3" id="amount" v-model="info.totalValue">
              </div>
              <div class="col-4">
                <label for="paid">Paid:</label>
                <select class="form-control m-2 mb-3" id="paid" v-model="info.paid">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>
          </div>
          <label for="remarks">Remarks:</label>
          <textarea class="form-control m-2 mb-3" id="remarks" v-model="info.remarks" />
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

  import { useStore } from '../stores/store';
  import { defineComponent } from 'vue';

  import Shipday from 'shipday/integration';
  import OrderInfoRequest from 'shipday/integration/order/request/order.info.request';
  import PaymentMethod from 'shipday/integration/order/types/payment.method';
  // import CardType from 'shipday/integration/order/types/card.type';
  // import OrderItem from 'shipday/integration/order/request/order.item';



  export default {
    setup() {
      const store = useStore();
      const getRestaurants = store.getRestaurants;
      const parseRestaurants = () => store.parseRestaurants();
      // const testSkills = () => orderStore.testSkills();
      // const fetchUsers = () => orderStore.fetchUsers();

      // return {
      //   getSkills,
      //   testSkills,
      //   fetchUsers,
      // };
      return {
        getRestaurants,
        parseRestaurants,
      };
    },
    data() {
      return {
        loading: false,
        restaurantOptions: [],
        selectedRestaurant: '',
        extractedText: '',
        info: {
          reference: '',
          guest: {
            name: '',
            address: '',
            phone: '',
          },
          pickupTime: null,
          expectedPickup: null,
          totalValue: null,
          paid: false,
          remarks: '',
        },
      };
    },
    computed: {
      restaurantInfo() {
        if (this.selectedRestaurant === '') return '';
        return this.restaurantOptions.filter((o) => o.restaurant === this.selectedRestaurant)[0];
      },
    },
    mounted() {
      this.parseRestaurantOptions();
    },
    methods: {
      reset() {
        this.info = {
          reference: '',
          guest: {
            name: '',
            address: '',
            phone: '',
          },
          pickupTime: null,
          expectedPickup: null,
          totalValue: null,
          paid: false,
          remarks: '',
        };
        this.extractedText = '';
        const textAreaInput = this.$refs.extractedText;
        textAreaInput.focus();
      },
      parseRestaurantOptions() {
        const options = localStorage.getItem('restaurants');
        this.restaurantOptions = JSON.parse(options) || [];
      },
      loadRestaurants() {
        const { fileInput } = this.$refs;
        fileInput.click();
      },
      handleFileSelect(event) {
        const file = event.target.files[0];
        this.readFile(file);
      },
      async readFile(file) {
        try {
          const text = await this.readFileAsync(file);
          const lines = text.split('\n').filter((l) => l !== '');
          console.log(lines);
          // Do something with the lines
          // localStorage.removeItem('restaurants');
          const newRestaurants = lines.map((r) => ({
            restaurant: r.split(';')[0],
            type: r.split(';')[1],
            phone: r.split(';')[2],
            address: r.split(';')[3],
          }));
          console.log(newRestaurants);
          localStorage.setItem('restaurants', JSON.stringify(newRestaurants));
          this.parseRestaurantOptions();
        } catch (error) {
          console.error('Error reading the file:', error);
        }
      },
      readFileAsync(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      },
      parsePdf() {
        const info = this.extractedText.trim();
        const sections = info.split('_______________________________');
        const reference = sections[0].split('\n')[3];
        const deliveryRegex = /20\d{2}\/\d{2}\/\d{2}/;
        const deliveryMatch = info.match(deliveryRegex);

        const totalValue = sections[3].replace('Gesamt ', '').replaceAll('\n', '').replaceAll('EUR', '');
        let remarks = '';
        if (info.includes('Anmerkungen')) {
          remarks = info.substring(info.indexOf('Anmerkungen:') + 12);
          remarks = remarks.substring(0, remarks.indexOf('__')).trim().replaceAll('\n', ' ');
        }
        const guestSection = sections[1].trim().split('\n');
        const firmaIndex = info.includes('Firma') ? 1 : 0;
        const guestName = guestSection[guestSection.length - 4 - firmaIndex];
        const guestAddress = `${guestSection[guestSection.length - 3 - firmaIndex]}, ${guestSection[guestSection.length - 2 - firmaIndex]}`;
        const guestPhone = guestSection[guestSection.length - 1 - firmaIndex].replace('Tel.:', '');

        const pickupRegex = /Bestätigte Uhrzeit\W*(\d{2}:\d{2})/;
        const pickupMatch = info.match(pickupRegex);
        const pickupTime = pickupMatch ? pickupMatch[1] : null;

        const expectedPickupRegex = /Gewünschte \w+\W*(\d{2}:\d{2})/;
        const expectedPickupMatch = info.match(expectedPickupRegex);
        let expectedPickup = null; //expectedPickupMatch ? `${expectedPickupMatch[1]}:00` : '';
        
        if (expectedPickupMatch) {
          const pickup = new Date();
          const pickupParts = expectedPickup.split(':');
          pickup.setHours(pickupParts[0]);
          pickup.setMinutes(pickupParts[1] - 20);
          const strDate = pickup.toString().split(' ')[4].split(':');
          expectedPickup = `${strDate[0]}:${strDate[1]}`;
        } else {
          const d = new Date();
          d.setMinutes(d.getMinutes() + 20);
          const strDate = d.toString().split(' ')[4].split(':');
          expectedPickup = `${strDate[0]}:${strDate[1]}`;
        }
        this.info.reference = reference;
        this.info.pickupTime = pickupTime;
        this.info.expectedPickup = expectedPickup;
        this.info.totalValue = parseFloat(totalValue);
        this.info.paid = info.includes('Payment Online');
        this.info.remarks = remarks;
        this.info.guest.name = guestName;
        this.info.guest.address = guestAddress;
        this.info.guest.phone = guestPhone;
      },
      parseFoodora() {
        const info = this.extractedText.trim();
        const referenceRegex = /foodora.+/;
        const referenceMatch = info.toLowerCase().match(referenceRegex);
        this.info.reference = referenceMatch[0];

        const nameRegex = /Kunde:(\W.+)/;
        const nameMatch = info.match(nameRegex);
        this.info.guest.name = nameMatch[1];

        const phoneRegex = /\+\d+/;
        const phoneMatch = info.match(phoneRegex);
        this.info.guest.phone = phoneMatch[0];

        let address = info.split('Adresse:')[1];
        address = address.split('Schon')[0];
        address = address.split('Bar')[0];
        address = address.replace('llnz,', 'linz');
        address = address.replace('LInz,', 'Linz');
        if (address.toLowerCase().includes('linz')) {
          console.log('split by linz');
          this.info.guest.address = `${address.split('Linz')[0]}Linz`;
          this.info.remarks = address.split('Linz')[1];
        } else {
          const zipCodeRegex = /\d{4}/;
          const zipCodeMatch = address.match(zipCodeRegex);
          console.log(zipCodeMatch);
          if (zipCodeMatch) {
            const splitCode = zipCodeMatch[0];
            this.info.guest.address = `${address.split(splitCode)[0]}${splitCode}`;
            this.info.remarks = address.split(splitCode)[1];
          }
          
        }

        const pickupRegex = /Lieferzeit\W(\d{2}:\d{2})/;
        const pickupMatch = info.match(pickupRegex);
        const pickupTime = pickupMatch ? pickupMatch[1] : null;
        this.info.pickupTime = pickupTime;

        if (pickupMatch) {
          const pickup = new Date();
          const pickupParts = pickupTime.split(':');
          pickup.setHours(pickupParts[0]);
          pickup.setMinutes(pickupParts[1] - 20);
          const strDate = pickup.toString().split(' ')[4].split(':');
          this.info.expectedPickup = `${strDate[0]}:${strDate[1]}`;
        } else {
          const d = new Date();
          d.setMinutes(d.getMinutes() + 20);
          const strDate = d.toString().split(' ')[4].split(':');
          this.info.expectedPickup = `${strDate[0]}:${strDate[1]}`;
        }

        const totalRegex = /€\W(\d+,\d{2})/g;
        const totalMatch = info.matchAll(totalRegex);
        console.log('total', totalMatch);
        const matchAll = Array.from(totalMatch);
        console.log('matchAll', matchAll);
        let totalAmount = 0;
        matchAll.forEach((m) => {
          const matchValue = parseFloat(m[0].substring(2).replace(',', '.'));
          if (matchValue > totalAmount) totalAmount = matchValue;
        });

        this.info.totalValue = totalAmount
        this.info.paid = info.toLowerCase().includes('schon bezahlt'); 
      },
      parseVenezia() {
        const info = this.extractedText.trim();
        const referenceRegex = /\w{4}-\w{4}-\w{4}/;
        const referenceMatch = info.match(referenceRegex);
        const lines = info.split('\n');
        this.info.reference = `${lines[lines.length - 1]} #${referenceMatch[0]}`;

        const nameRegex = /Name\W?:\W?(.+)/;
        const nameMatch = info.match(nameRegex);
        this.info.guest.name = nameMatch[1];

        const phoneRegex = /.+-.+.+\W(.+)\WKundennr/;
        const phoneMatch = info.match(phoneRegex);
        this.info.guest.phone = phoneMatch[1];

        let address = info.split('Adresse :')[1];
        address = address.split('Lieferzeit')[0].trim();
        address = address.replace('llnz,', 'linz');
        address = address.replace('LInz,', 'Linz');
        
        const extraDetailsRegex = /-\/\d+\/\d+/;
        const extraDetailsMatch = address.match(extraDetailsRegex);
        if (extraDetailsMatch) {
          address = address.replace(extraDetailsMatch[0], ' ');
          this.info.remarks = extraDetailsMatch[0] + '\n';
        }
        this.info.guest.address = address;

        const pickupRegex = /Lieferzeit\W?:\W?(\d{2}:\d{2})/;
        const pickupMatch = info.match(pickupRegex);
        const pickupTime = pickupMatch ? pickupMatch[1] : null;
        this.info.pickupTime = pickupTime;

        if (pickupMatch) {
          const pickup = new Date();
          const pickupParts = pickupTime.split(':');
          pickup.setHours(pickupParts[0]);
          pickup.setMinutes(pickupParts[1] - 20);
          const strDate = pickup.toString().split(' ')[4].split(':');
          this.info.expectedPickup = `${strDate[0]}:${strDate[1]}`;
        } else {
          const d = new Date();
          d.setMinutes(d.getMinutes() + 20);
          const strDate = d.toString().split(' ')[4].split(':');
          this.info.expectedPickup = `${strDate[0]}:${strDate[1]}`;
        }
        let remarks = info.split('Bemerkung:')[1];
        remarks = remarks.split('Rechnungsnummer')[0].trim();
        this.info.remarks += remarks;
        const totalRegex = /Gesamt\W?:\W?(\d+,\d{2})/;
        const totalMatch = info.match(totalRegex);
        this.info.totalValue = parseFloat(totalMatch[1].replace(',', '.'));
        this.info.paid = info.toLowerCase().includes('onlinebezahlung');
        
      },
      parseInfo() {
        try {
          const decodedText = decodeURIComponent(this.extractedText);
          this.extractedText = decodedText;
          console.log('text was decoded');
        } catch (error) {
          console.log('text is not encoded');
        }
        
        this.info = {
          reference: '',
          guest: {
            name: '',
            address: '',
            phone: '',
          },
          pickupTime: null,
          expectedPickup: null,
          totalValue: null,
          paid: false,
          remarks: '',
        };
        if (this.extractedText.toString().toLowerCase().includes('tel:')) {
          this.parseVenezia();
        } else if (this.extractedText.toString().toLowerCase().includes('foodora')) {
          this.parseFoodora();
        } else {
          this.parsePdf();
        }
        this.selectRestaurant();
      },
      selectRestaurant() {
        this.restaurantOptions.forEach((r) => {
          if (this.extractedText.toLowerCase().includes(r.restaurant.toLowerCase())) {
            this.selectedRestaurant = r.restaurant;
          }
        });
      },
      sendRequest() {
        this.loading = true;
        // my token
        // const shipdayClient = new Shipday('6qyxRrWNFI.gilb3OXDv8gUAfGpaVF9', 10000);
        /// const shipdayClient = new Shipday('dGnbvDVee8.oIKyoT7akhauwwA5j1fN', 10000);
        
        const shipdayClient = new Shipday('L4bQFSIvBZ.8Ye6y6plnJ1nlYdke2ap', 10000);
        try {
          shipdayClient.carrierService.getCarriers().then(r => console.log(r[0]));
          const restaurantName = `${this.restaurantInfo.type} - ${this.restaurantInfo.restaurant}`;
          const orderInfoRequest = new OrderInfoRequest(
            this.info.reference,
            this.info.guest.name,
            `${this.info.guest.address}, Austria`,
            "no mail",
            this.info.guest.phone,
            restaurantName,
            `${this.restaurantInfo.address}, Austria`,
          );

          orderInfoRequest.setRestaurantPhoneNumber(this.restaurantInfo.phone);
          const deliveryDate = new Date().toISOString().split('T')[0];
          orderInfoRequest.setExpectedDeliveryDate(deliveryDate);
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
          let remarks = this.info.remarks || '';
          if (!this.info.paid) remarks = `Achtung ‼️ Bargeld\n${remarks}`;
          if (this.info.remarks !== '') orderInfoRequest.setDeliveryInstruction(remarks);
          orderInfoRequest.setOrderSource("Seamless");
          // orderInfoRequest.setAdditionalId("4532");
          // orderInfoRequest.setClientRestaurantId(12);
          const paymentOption = this.info.paid ? PaymentMethod.CREDIT_CARD : PaymentMethod.CASH;
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
        } catch (error) {
          this.loading = false;
          alert(error);
        }
        
      },
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
  /* .row {
    min-height: 100vh;
  } */
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
