# dds-parser
DDS parser (header and raw data).
Heavely based (copy-paste) on the [https://www.npmjs.com/package/parse-dds](parse-dds) and [https://github.com/flowtsohg/mdx-m3-viewer](mdx-m3-viewer).

## Installation

```
npm i dds-parser
```

## Usage

```ts
import { decodeDds, parseHeaders } from 'dds-parser';

const info = parseHeaders(arrayBuffer);

console.log(info.format);

const image = info.images[0];
const rgba = decodeDds(
    arrayBuffer.slice(image.offset, image.offset + image.length),
    info.format,
    image.shape.width,
    image.shape.height
);
```

## Thanks

GhostWolf (aka flowtsohg)
Jam3
toji