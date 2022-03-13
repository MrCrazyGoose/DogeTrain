let birds = document.querySelectorAll(".bird");
birds.forEach(bird => bird.addEventListener("click", function(){
    navigator.share({
        url:"https://train.cf",
        text:"There is this cool game called DogeTrain! No way your better than me! It's called DogeTrain and its kind of addicting. You can try it too with the link below!"
    });
}));