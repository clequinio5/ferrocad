import { atom } from 'recoil'

const selectedComponentPropertiesAtom = atom({
    key: 'selectedComponentProperties',
    default: {},
});

const paneLogItemsAtom = atom({
    key: 'paneLogItems',
    default: [],
});

export {
    selectedComponentPropertiesAtom,
    paneLogItemsAtom
}