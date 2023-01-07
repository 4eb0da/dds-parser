import { parseHeaders } from './parseHeaders';
import { decodeDxt1, decodeDxt3, decodeDxt5, decodeRgtc, decodeDds } from './decode';

const ddsParser = {
    parseHeaders,
    decodeDxt1,
    decodeDxt3,
    decodeDxt5,
    decodeRgtc,
    decodeDds
};

declare global {
    interface Window {
        ddsParser: typeof ddsParser;
    }
}

window.ddsParser = ddsParser;
