window.addEventListener('load', function() {
  const headingDivs = document.getElementsByClassName('topic');
  const toc = [];
  const noOfHeadingDivs = headingDivs.length;
  for (let i=0; i<noOfHeadingDivs; i++) {
    const heading = headingDivs[i].getElementsByTagName('h2')[0];
    toc.push(heading);
  }
  let tocElement = '<ul>'
  toc.forEach((content) => {
    const id = content.id;
    const innerHTML = content.innerHTML;
    tocElement += `<li><a href='#${id}'>${innerHTML}</a></li>`
  });
  tocElement += '</ul>';
  console.log(tocElement);
  document.getElementById('menu-content').innerHTML = tocElement;
});