import{s as c,n as o}from"./scheduler.CkfNxMIO.js";import{S as d,i as m,e as h,l as u,a as _,b as p,n as g,f,g as v,h as k,p as q,r as y,q as R}from"./index.CkyykvjN.js";import{g as S}from"./entry.CjenTNiK.js";function b(i){let t,a=(i[1]?i[1]:i[0])+"",s,l,r;return{c(){t=h("div"),s=u(a),this.h()},l(e){t=_(e,"DIV",{class:!0});var n=p(t);s=g(n,a),n.forEach(f),this.h()},h(){v(t,"class","ref svelte-pkpllq")},m(e,n){k(e,t,n),q(t,s),l||(r=y(t,"click",i[2]),l=!0)},p(e,[n]){n&3&&a!==(a=(e[1]?e[1]:e[0])+"")&&R(s,a)},i:o,o,d(e){e&&f(t),l=!1,r()}}}function C(i,t,a){let{page:s=""}=t,{title:l=""}=t;const r=()=>{S(`${s}`)};return i.$$set=e=>{"page"in e&&a(0,s=e.page),"title"in e&&a(1,l=e.title)},[s,l,r]}class V extends d{constructor(t){super(),m(this,t,C,b,c,{page:0,title:1})}}export{V as R};