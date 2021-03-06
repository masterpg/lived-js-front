"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const qs = require("qs");
/**
 * ロケーション情報を格納するデータクラスです。
 */
class LocationData {
    constructor(src) {
        this.url = '';
        this.protocol = '';
        this.domain = '';
        this.port = '';
        this.host = '';
        this.path = '';
        this.hash = '';
        this.dir = '';
        this.base = '';
        this.ext = '';
        this.query = {};
        if (!src) {
            return;
        }
        const REG_BASE = /([^/?#]*)$/;
        const REG_DIR = /(?:([^?#]*)\/)*/;
        const REG_EXT = /(?:[^./]+)(\.[^/.]+)$/;
        this.url = src.href;
        this.protocol = src.protocol;
        this.domain = src.hostname;
        this.port = src.port;
        this.path = decodeURIComponent(src.pathname);
        this.hash = decodeURIComponent(src.hash.substring(1));
        this.host = src.host;
        const testedDir = REG_DIR.exec(this.path);
        this.dir = testedDir ? decodeURIComponent(testedDir[1]) : '';
        const testedBase = REG_BASE.exec(this.path);
        this.base = testedBase ? decodeURIComponent(testedBase[1]) : '';
        const testedExt = REG_EXT.exec(this.path);
        this.ext = testedExt ? decodeURIComponent(testedExt[1]) : '';
        this.query = qs.parse(src.search.substring(1));
    }
}
exports.LocationData = LocationData;
/**
 * ロケーションを変更します。
 * @param path 変更するパスを指定します。
 * @param query 変更するパスに付与するクエリオブジェクトを指定します。
 */
function moveTo(path, query = {}) {
    let url = path;
    if (Object.keys(query).length) {
        url += `?${qs.stringify(query)}`;
    }
    window.history.pushState({}, '', url);
    window.dispatchEvent(new CustomEvent('location-changed'));
}
exports.moveTo = moveTo;
/**
 * 指定されたurlをパースし、その情報を取得します。
 * @param url
 */
function parse(url) {
    const anchor = document.createElement('a');
    anchor.href = url;
    return new LocationData(anchor);
}
exports.parse = parse;
/**
 * 指定されたパスのベースを取得します。
 * 例: "/foo/bar/index.html"が指定された場合、"index.html"が返されます。
 * @param path パスを指定します。
 */
function getBase(path) {
    return parse(path).base;
}
exports.getBase = getBase;
/**
 * 指定されたパスから拡張子を取得します。
 * 例: "/foo/bar/index.html"が指定された場合、".html"が返されます。
 * @param path パスを指定します。
 */
function getExt(path) {
    return parse(path).ext;
}
exports.getExt = getExt;
/**
 * 指定されたパスからディレクトリを取得します。
 * 例: "/foo/bar/index.html"が指定された場合、"/foo/bar"が返されます。
 * @param path パスを指定します。
 */
function getDir(path) {
    return parse(path).dir;
}
exports.getDir = getDir;
/**
 * 指定されたパスをURLに変換します。
 * @param path
 */
function toUrl(path) {
    return parse(path).url;
}
exports.toUrl = toUrl;
/**
 * 指定されたURLをパスに変換します。
 * 例: "http://localhost:5000/foo/bar/index.html"が指定された場合、
 *     "/foo/bar/index.html"が返されます。
 * @param url
 */
function toPath(url) {
    return parse(url).path;
}
exports.toPath = toPath;
/**
 * 現在のワーキングディレクトリをパスで取得します。
 * @param climbSteps ワーキングディレクトリをのぼるステップ数を指定します。
 *   例: ワーキングディレクトが /root/foo/var で、引数に｢2｣を指定した場合、戻り値は /root になる。
 */
function cwd(climbSteps = 0) {
    let dir = getDir(parse(window.location.href).path);
    dir = dir.replace(new RegExp(`(?:\\\/+[^\\\/]*){0,${climbSteps}}$`), '');
    return dir;
}
exports.cwd = cwd;
/**
 * 指定されたパスを連結します。
 * @param args
 */
function join(...args) {
    if (args.length <= 1) {
        args.unshift(cwd());
    }
    let path = '';
    for (const segment of args) {
        if (!path) {
            path += segment;
        }
        else {
            path += '/' + segment;
        }
    }
    return __normalize(path);
}
exports.join = join;
/**
 * 指定されたパスを配列に分割します。
 * @param path
 */
function split(path) {
    const isAbsolutePath = __isAbsolute(path);
    return __normalizeArray(path.split('/'), !isAbsolutePath);
}
exports.split = split;
//----------------------------------------------------------------------
//
//  Internal methods
//
//----------------------------------------------------------------------
/**
 * normalize path
 */
function __normalize(path) {
    const isAbsolutePath = __isAbsolute(path);
    const trailingSlash = path && path[path.length - 1] === '/';
    let pathStr = __normalizeArray(path.split('/'), !isAbsolutePath).join('/');
    if (!pathStr && !isAbsolutePath) {
        pathStr += '.';
    }
    if (pathStr && trailingSlash) {
        pathStr += '/';
    }
    return (isAbsolutePath ? '/' : '') + pathStr;
}
/**
 * normalize array
 * @param parts
 * @param allowAboveRoot
 */
function __normalizeArray(parts, allowAboveRoot) {
    const res = [];
    for (const p of parts) {
        if (!p || p === '.')
            continue;
        if (p === '..') {
            if (res.length && res[res.length - 1] !== '..') {
                res.pop();
            }
            else if (allowAboveRoot) {
                res.push('..');
            }
        }
        else if (/^http(s)?:/.test(p)) {
            res.push(p + '/');
        }
        else {
            res.push(p);
        }
    }
    return res;
}
/**
 * 指定されたパスが絶対パスかを否かを取得します。
 */
function __isAbsolute(path) {
    return path.charAt(0) === '/';
}
