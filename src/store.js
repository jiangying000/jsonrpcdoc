import Vue from "vue";
import Vuex from "vuex";
import JSRP from "json-schema-ref-parser";

Vue.use(Vuex);

function newEmptyApiSchema() {
  return {
    document: {
      original: {
        schema: {},
        deref: {},
      },
      modified: {
        schema: {},
        deref: {},
      },
    },
    selected: 0, // selected methodId,
    error: false, // json parse error
  };
}

export default new Vuex.Store({
  state: {
    apiId: "ubiq", // selected apiId (ubiq, etc, custom)
    clientVer: false,
    drawers: {
      left: true,
      right: true,
    },
    editMode: false,
    position: {
      lineNumber: 1,
      column: 1,
    },
    errors: [],
    apis: {
      ubiq: {
        openrpc: newEmptyApiSchema(),
        info: {
          to: "/ubiq",
          icon: "apis/ubiq.svg",
          json:
            "https://raw.githubusercontent.com/ubiq/ubiq-json-rpc-specification/master/openrpc.json",
          title: "Ubiq",
          desc: "Ubiq mainnet",
          url: "https://rpc.octano.dev",
        },
      },
      etc: {
        openrpc: newEmptyApiSchema(),
        info: {
          to: "/etc",
          icon: "apis/etc.svg",
          json:
            "https://raw.githubusercontent.com/etclabscore/ethereum-json-rpc-specification/master/openrpc.json",
          title: "Ethereum Classic",
          desc: "ETC mainnet",
          url: "https://etc-geth.0xinfra.com",
        },
      },
      example: {
        openrpc: newEmptyApiSchema(),
        info: {
          to: "/example",
          icon: "openrpc.png",
          json:
            "https://raw.githubusercontent.com/octanolabs/d0x/master/openrpc.json",
          title: "Example Document",
          desc: "New OpenRPC document",
          url: "http://localhost:3301",
        },
      },
      custom: {
        openrpc: newEmptyApiSchema(),
        info: {
          to: "/custom",
          icon: "octano.svg",
          title: "Custom Document",
          desc: "Custom OpenRPC document",
          url: "http://127.0.0.1:8588",
          requestType: "POST",
        },
      },
    },
  },
  mutations: {
    setOpenRpcOriginal(state, payload) {
      state.apis[payload.apiId].openrpc.document.original.schema = payload.json;
      if (payload.modified) {
        state.apis[payload.apiId].openrpc.document.modified.schema =
          payload.json;
      }
      // JSON deep copy fuckery to prevent deref referencing payload.json (we don't want the deref going back to schema)
      JSRP.dereference(
        JSON.parse(JSON.stringify(payload.json)),
        (err, deref) => {
          if (err) {
            state.errors.push(err);
          } else {
            let methods = deref.methods;
            // add a numeric ID to each method
            let count = 0;
            for (let method of methods) {
              method.methodId = count;
              methods[count] = method;
              count++;
            }
            state.apis[payload.apiId].openrpc.document.original.deref = deref;
            if (payload.modified) {
              state.apis[payload.apiId].openrpc.document.modified.deref = deref;
            }
          }
        }
      );
    },
    setOpenRpcModified(state, payload) {
      state.apis[payload.apiId].openrpc.document.modified.schema = payload.json;
      state.apis[payload.apiId].openrpc.error = false; // reset error
      // JSON deep copy fuckery to prevent deref referencing payload.json (we don't want the deref going back to schema)
      JSRP.dereference(
        JSON.parse(JSON.stringify(payload.json)),
        (err, deref) => {
          if (err) {
            state.errors.push(err);
          } else {
            let methods = deref.methods;
            // add a numeric ID to each method
            let count = 0;
            for (let method of methods) {
              method.methodId = count;
              methods[count] = method;
              count++;
            }
            state.apis[payload.apiId].openrpc.document.modified.deref = deref;
          }
        }
      );
    },
    setOpenRpcError(state, payload) {
      state.apis[payload.apiId].openrpc.error = payload.err;
    },
    setSelected(state, payload) {
      state.apis[payload.apiId].openrpc.selected = payload.method;
    },
    toggleDrawer(state, side) {
      // side: 'left' or 'right'
      state.drawers[side] = !state.drawers[side];
    },
    setApiId(state, payload) {
      state.apiId = state.apis[payload] ? payload : "ubiq";
    },
    setClientVer(state, payload) {
      state.clientVer = payload;
    },
    setEditMode(state, payload) {
      state.editMode = payload;
    },
    setEditorPosition(state, payload) {
      state.position = payload;
    },
    addError(state, payload) {
      state.errors.push(payload);
    },
    setCustom(state, { address, requestType }) {
      state.apis.custom.info.url = address;
      state.apis.custom.info.requestType = requestType;
    },
  },
  actions: {},
});
