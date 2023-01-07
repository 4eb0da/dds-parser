const DDS_MAGIC = 0x20534444;
const DDSD_MIPMAPCOUNT = 0x20000;
const DDPF_FOURCC = 0x4;

const FOURCC_DXT1 = fourCCToInt32('DXT1');
const FOURCC_DXT3 = fourCCToInt32('DXT3');
const FOURCC_DXT5 = fourCCToInt32('DXT5');
// var FOURCC_DX10 = fourCCToInt32('DX10')
// var FOURCC_FP32F = 116 // DXGI_FORMAT_R32G32B32A32_FLOAT
const FOURCC_ATI2 = fourCCToInt32('ATI2'); // BC5, RGTC, 3Dc

// const DDSCAPS2_CUBEMAP = 0x200;
// const D3D10_RESOURCE_DIMENSION_TEXTURE2D = 3;
// const DXGI_FORMAT_R32G32B32A32_FLOAT = 2;

// The header length in 32 bit ints
const headerLengthInt = 31;

// Offsets into the header array
const off_magic = 0;
const off_size = 1;
const off_flags = 2;
const off_height = 3;
const off_width = 4;
const off_mipmapCount = 7;
const off_pfFlags = 20;
const off_pfFourCC = 21;
// const off_caps2 = 28;

export type DdsFormat = 'dxt1' | 'dxt3' | 'dxt5' | 'ati2';

export interface DdsInfo {
    // width, height
    shape: {
        width: number;
        height: number;
    };
    images: Array<{
        // byte offset
        offset: number;
        // by length
        length: number;
        // width, height
        shape: {
            width: number;
            height: number;
        };
    }>;
    format: DdsFormat;
    flags: number;
    // cubemap: boolean;
}

export function parseHeaders (arrayBuffer: ArrayBuffer): DdsInfo {
    const header = new Int32Array(arrayBuffer, 0, headerLengthInt);

    if (header[off_magic] !== DDS_MAGIC) {
        throw new Error('Invalid magic number in DDS header');
    }

    if (!(header[off_pfFlags] & DDPF_FOURCC)) {
        throw new Error('Unsupported format, must contain a FourCC code');
    }

    let blockBytes;
    let format: DdsFormat;
    const fourCC = header[off_pfFourCC];
    switch (fourCC) {
    case FOURCC_DXT1:
        blockBytes = 8;
        format = 'dxt1';
        break;
    case FOURCC_DXT3:
        blockBytes = 16;
        format = 'dxt3';
        break;
    case FOURCC_DXT5:
        blockBytes = 16;
        format = 'dxt5';
        break;
    /* case FOURCC_FP32F:
        format = 'rgba32f';
        break; */
    case FOURCC_ATI2:
        blockBytes = 16;
        format = 'ati2';
        break;
    /* case FOURCC_DX10:
        var dx10Header = new Uint32Array(arrayBuffer.slice(128, 128 + 20));
        format = dx10Header[0];
        var resourceDimension = dx10Header[1];
        var miscFlag = dx10Header[2];
        var arraySize = dx10Header[3];
        var miscFlags2 = dx10Header[4];

        if (resourceDimension === D3D10_RESOURCE_DIMENSION_TEXTURE2D && format === DXGI_FORMAT_R32G32B32A32_FLOAT) {
            format = 'rgba32f';
        } else {
            throw new Error('Unsupported DX10 texture format ' + format);
        }
        break; */
    default:
        throw new Error('Unsupported FourCC code: ' + int32ToFourCC(fourCC));
    }

    const flags = header[off_flags];
    let mipmapCount = 1;

    if (flags & DDSD_MIPMAPCOUNT) {
        mipmapCount = Math.max(1, header[off_mipmapCount]);
    }

    // let cubemap = false;
    // const caps2 = header[off_caps2];
    /* if (caps2 & DDSCAPS2_CUBEMAP) {
        cubemap = true;
    } */

    let width = header[off_width];
    let height = header[off_height];
    let dataOffset = header[off_size] + 4;
    const texWidth = width;
    const texHeight = height;
    const images: {
        offset: number;
        length: number;
        shape: {
            width: number;
            height: number;
        };
    }[] = [];
    let dataLength;

    /* if (fourCC === FOURCC_DX10) {
        dataOffset += 20;
    } */

    /* if (cubemap) {
        for (let f = 0; f < 6; f++) {
            if (format !== 'rgba32f') {
                throw new Error('Only RGBA32f cubemaps are supported');
            }
            const bpp = 4 * 32 / 8;

            width = texWidth;
            height = texHeight;

            // cubemap should have all mipmap levels defined
            // Math.log2(width) + 1
            const requiredMipLevels = Math.log(width) / Math.log(2) + 1;

            for (let i = 0; i < requiredMipLevels; i++) {
                dataLength = width * height * bpp;
                images.push({
                    offset: dataOffset,
                    length: dataLength,
                    shape: [ width, height ]
                });
                // Reuse data from the previous level if we are beyond mipmapCount
                // This is hack for CMFT not publishing full mipmap chain https://github.com/dariomanesku/cmft/issues/10
                if (i < mipmapCount) {
                    dataOffset += dataLength;
                }
                width = Math.floor(width / 2);
                height = Math.floor(height / 2);
            }
        }
    } else { */
    for (let i = 0; i < mipmapCount; i++) {
        dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes;

        images.push({
            offset: dataOffset,
            length: dataLength,
            shape: {
                width,
                height
            }
        });
        dataOffset += dataLength;
        width = Math.floor(width / 2);
        height = Math.floor(height / 2);
    }
    /* } */

    return {
        shape: {
            width: texWidth,
            height: texHeight
        },
        images,
        format,
        flags,
        // cubemap: false
    };
}

function fourCCToInt32 (value: string): number {
    return value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24);
}

function int32ToFourCC (value: number): string {
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    );
}
