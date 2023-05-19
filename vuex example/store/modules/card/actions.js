import _ from "lodash";
import Axios from "axios";


export const Actions = {
    init() {
    },

    loadCards(context, payload = { page: 1, withTimestamp: true, timestamp:0 }) {
        let timestampValue = 0;
        let page = (payload.page)?payload.page:1;

        if(payload.withTimestamp){
            timestampValue = (!payload.timestamp)?context.getters['getTimestamp']:payload.timestamp;
        }

       // console.log('payload.page', payload.page);
      //  console.log('payload.withTimestamp', payload.withTimestamp);

        let request = Axios.get("/fe/card", {
            params: {
                page: page,
                time: timestampValue
            }
        })
            .then((response) => {
                if (response.data.cards) {
                    let dataTimestamp = response.data._timestamp;
                    if(dataTimestamp) context.commit('setTimestamp', dataTimestamp);
                    context.commit('loadCards', response.data.cards);
                    if (response.data._isNext && response.data._isNext === true) {
                       return context.dispatch('loadCards', {
                           page: (Number(page) + 1),
                           withTimestamp: payload.withTimestamp,
                           timestamp: timestampValue
                       });
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
        return request;
    },
    getCardsForTableView({dispatch, rootGetters, commit }, payload = 0) {
      let page = 1;
      let url = '/fe/cards/page/';
      if (!_.isEmpty(payload)) url = '/fe/cards/' + payload + '/page/';
      let loadPage = () => {
        Axios.post(url + page)
          .then(response => {
            commit('cardsUpdated', response.data.cards);
            if (response.data.deletedCards) {
              _.forEach(response.data.deletedCards, function (i) {
                commit('deleteCardById', i)
              })
            }
            if (response.data._timestamp && response.data._timestamp > 0 && rootGetters['updater/lastTimestamp'] == 0) {
              dispatch('updater/setLastTimestamp', response.data._timestamp, {root: true});
            }
            if (response.data._page) {
              page = response.data._page;
              loadPage();
            }
          })
          .catch(error => {
            console.log(error);
          });
      };
      loadPage();

  },
    deleteCardById(context, id){
      context.commit('deleteCardById', id);
    },
    loadHiddenStatuses(context) {
      Axios({
        method: 'get',
        responseType: 'json',
        url: '/fe/cards/kanban/hidden-statuses',
        validateStatus: function (status) {
          return status < 500;
        },
      })
        .then(response => {
          if (response.data._status) {
            context.commit('updateUserHiddenStatuses', response.data.userHiddenStatuses);
            context.commit('updateVendorHiddenStatuses', response.data.vendorHiddenStatuses);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
};
