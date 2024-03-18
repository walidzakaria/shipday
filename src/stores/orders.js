
import { defineStore } from 'pinia';
import axios from 'axios';

export const useOrderStore = defineStore({
  id: 'order',
  state: () => ({
    count: 0,
    skills: ['no value'],
  }),

  getters: {
    getCount() {
      return this.count
    },
    getSkills(state) {
      return state.skills;
    },
  },
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    testSkills() {
      console.log('invoked');
      this.skills = ['another'];
    },
    async fetchUsers() {
      console.log('fetching');
      const postData = {
        orderNumber: 'AVJBS6',
        customerName: 'lukas felbermair',
        customerAddress: 'Leonfeldner Straße 91, 4040 Linz',
        customerPhoneNumber: '06641803610',
        restaurantName: 'La fiesta',
        restaurantAddress: 'Friedensplatz 3, 4020 Linz',
        restaurantPhoneNumber: '43 660 9217020',
        expectedDeliveryDate: '2024-03-17',
        expectedPickupTime: '10:52:00',
        expectedDeliveryTime: '10:52:00',
        totalOrderCost: 27.0,
        deliveryInstruction: 'fast plz',
        orderSource: 'Shipday',
        creditCardType: 'visa',
      };
      const headers = {
        'Accept': 'application/json',
        'Authorization': 'Basic BgxsDwd00n.LNNn90QydrjgZ1K9dS13',
        'Content-Type': 'application/json',
        'x-api-key': 'null'
      }

      axios.post('https://api.shipday.com/orders', postData, {
        headers: headers
      })
        .then(response => {
          // Handle success
          console.log('Response:', response.data)
        })
        .catch(error => {
          // Handle error
          console.error('Error:', error)
        })
    },
  },
})
