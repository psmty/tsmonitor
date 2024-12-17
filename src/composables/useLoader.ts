import {readonly, ref} from 'vue';

const store = ref({
  visible: true
});

export const showLoader = (visible = true) => {
  store.value.visible = visible;
};

export const useLoader = () => {
  return {state: readonly(store), showLoader}
}
