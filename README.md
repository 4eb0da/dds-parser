# dds-parser
DDS parser (header and raw data).
Heavely based (copy-paste) on the [parse-dds](https://www.npmjs.com/package/parse-dds) and [mdx-m3-viewer](https://www.npmjs.com/package/mdx-m3-viewer).

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

## Supported formats

* `dxt1`
* `dxt3`
* `dxt5`
* `ati2`

## Thanks

GhostWolf (aka flowtsohg)
Jam3
toji