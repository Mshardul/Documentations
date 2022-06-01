window.addEventListener('load', function() {
  /* create Table of content */
  const headingDivs = document.getElementsByClassName('topic');
  let tocElement = '<ul>';
  const noOfHeadingDivs = headingDivs.length;
  for (let i = 0; i < noOfHeadingDivs; i++) {
    const headingId = headingDivs[i].id;
    const headingTitle = headingDivs[i].getElementsByTagName('h2')[0].innerHTML;
    console.log(headingId, headingTitle);
    tocElement += `<li><a href='#${headingId}'>${headingTitle}</a></li>`;
  }
  tocElement += '</ul>';
  console.log(tocElement);
  document.getElementById('menu-content').innerHTML = tocElement;
});