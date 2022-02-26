let today = new Date(Date.now());
if (today.getDate() === 1 && today.getMonth() === 3) {
	document.querySelectorAll("*").forEach(x => x.classList.add("fools"));
}