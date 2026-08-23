(()=>{
function ensureWinterArtwork(){
  const sky=document.querySelector('.wa2AlbumSky');
  if(!sky||sky.querySelector('.wa2WinterScene'))return;
  const img=document.createElement('img');
  img.className='wa2WinterScene';
  img.src='./wa2-winter-scene.svg';
  img.alt='';
  img.setAttribute('aria-hidden','true');
  img.decoding='async';
  sky.prepend(img);
}
const style=document.createElement('style');
style.id='wa2ArtworkFixStyles';
style.textContent=`
html[data-theme="wa2"] .wa2AlbumSky{background:#102234!important}
html[data-theme="wa2"] .wa2AlbumSky:after{display:none!important}
html[data-theme="wa2"] .wa2WinterScene{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;pointer-events:none}
html[data-theme="wa2"] .wa2AlbumMeta,html[data-theme="wa2"] .wa2AlbumEdge{position:absolute;z-index:5}
`;
document.head.appendChild(style);
ensureWinterArtwork();
window.addEventListener('hot100themechange',ensureWinterArtwork);
window.HOT100_WA2_ARTWORK={ensure:ensureWinterArtwork,mode:'explicit-image'};
})();