import { defineStore } from 'pinia';

export const useStore = defineStore({
  id: 'store',
  state: () => ({
    restaurants: ['walid']
  }),
  getters: {
    getRestaurants(state) {
      return state.restaurants;
    },
  },
  actions: {
    parseRestaurants() {
      console.log('press');
    },
  },
});
