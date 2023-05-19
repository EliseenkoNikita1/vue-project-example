import {Actions} from './actions';
import {Mutations} from './mutations';
import {Getters} from './getters';

const state = {
    items: [],
    sortByForCardsAll: '',
    sortDescForCardsAll: false,
    sortByForCardsActive: '',
    sortDescForCardsActive: false,
    sortByForCardsOpen: '',
    sortDescForCardsOpen: false,
    sortByForCardsClosed: '',
    sortDescForCardsClosed: false,
    perPage: 50,
    cardsAllCurrentPage: 1,
    cardsOpenCurrentPage: 1,
    cardsActiveCurrentPage: 1,
    cardsClosedCurrentPage: 1,
    timestamp: 0,
    hiddenStatuses: {
      userHiddenStatuses: [],
      vendorHiddenStatuses: [],
    },
};

export default {
    namespaced: true,
    mutations: Mutations,
    actions: Actions,
    state,
    getters: Getters,
};
