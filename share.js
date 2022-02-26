let birds = document.querySelectorAll(".bird");
birds.forEach(bird => bird.addEventListener("click", function(){
    navigator.share({
        url:"https://train.cf",
        text:"I found the best mobile-friendly web game! No way your better than me! It's called DogeTrain. Play this"
    });
}));