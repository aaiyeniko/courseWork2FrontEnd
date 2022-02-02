var store = new Vue({
    el: '#app',
    data: {
        showProduct: true,
        sitename: 'After School Lessons',
        cart: [],
        sortBy: "subject",
        orderBy: 'ascending',
        searchValue: '',
        Lessons: [],  
        checkout: {
            Name: '',
            Phone_No: null,
            lessonId: []

        } ,
        userInfo: [],
        currentUserId: ''
    },

    created: function() {
        console.log('requesting all Lessons from server')
            fetch('https://courseworktwoo.herokuapp.com/collection/Lessons/').then(
                function(response) {
                    response.json().then(
                        function(json){
                            store.Lessons = json;
                            console.log(json);
                        }
                    )
                }
            )

            console.log('requesting all Users from server')
            fetch('https://courseworktwoo.herokuapp.com/collection/Orders/').then(
                function(response) {
                    response.json().then(
                        function(json){
                            store.userInfo = json;
                            console.log(json);
                        }
                    )
                }
            )
            console.log('requesting all Users from server')
            fetch('https://courseworktwoo.herokuapp.com/collection/Orders/61fa81d9b26b6bb367f8a054').then(
                function(response) {
                    response.json().then(
                        function(json){
                            store.currentUserId = json;
                            console.log(json);
                        }
                    )
                }
            )
            
    },
         

    methods: {
        //add a course to the cart
        addCourseToCart(lesson) {
                if(lesson.spaces > 0){
                   --lesson.spaces  
                }            
                console.log(this.currentUserId.Name)
                console.log(this.currentUserId._id)
                for(var i = 0; i< this.Lessons.length; i++){
                    if(lesson.id == this.Lessons[i].id){
                        lesson.numberPurchased++
                        this.cart.push(lesson)
                        this.checkout.lessonId.push("id: " + lesson._id)
                        this.checkout.lessonId.push("Space(s): " + lesson.numberPurchased)
                    }
                }
            },
        //checks if course can be added to the cart
        canAddToCart(lesson) {
            return lesson.availableInventory > this.itemsInCart(lesson);
        },
        //remove a course from the cart
        removeCourseFromCart(lesson) {
            this.cart.pop(lesson); 
            lesson.numberPurchased--  
            this.checkout.lessonId.pop(lesson._id)
            this.checkout.lessonId.pop(lesson.numberPurchased)
            ++lesson.spaces 
        },
        //takes you to checkout screen
        showCheckout() {
            this.showProduct = this.showProduct ? false : true;
        },
        //counts the number of items in the cart
        itemsInCart(id) {
            let count = 0;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i] === id) {
                    count++
                }
            }
            return count;
        },
        //checks if the details submitted for the name and number are accurate
        isNumber() {
            let phoneNumber = document.getElementById("phone-number")
            let name = document.getElementById("name")
            let submitBtn = document.querySelector(".submitBtn")
            var integers = /^[0-9]+$/
            var letters = /^[A-Za-z]+$/
            if (phoneNumber.value.match(integers) && name.value.match(letters)) {
                alert('Your Registration number has accepted....');

                if( this.checkout.Name != '' && this.checkout.Phone_No != null){
                    if(this.checkout.Name === this.currentUserId.Name){
                        fetch('https://courseworktwoo.herokuapp.com/collection/Orders/' + this.currentUserId._id , {
                            method: 'PUT',
                            body: JSON.stringify(this.checkout),
                            headers: {'Content-Type': 'application/json' }
                        }).then(response => response.json())
                        .then(json => console.log(json)) 
                        alert("Order Updated successfully!")
                    }
                    else{    
                        console.log("posting")                
                        fetch('https://courseworktwoo.herokuapp.com/collection/Orders', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json' },
                            body: JSON.stringify(this.checkout)
                        }).then(response => response.json())
                        .then(json => console.log(json)) 
                        alert("Order placed successfully!")             
                    }
                }

                return true;
            }
            else {
                alert('Please input only numeric characters for Phone number and letters for Name');

                return false;
            }
        },

    },
    computed: {

        //count number of items in the cart
        cartItemCount: function () {
            return this.cart.length;
        },

        //sort lessons in ascending or descending order, or according to lesson properties
        sortLessons() {
            let lessonOrder = this.Lessons;

            lessonOrder = lessonOrder.sort((a, b) => {
                if (this.sortBy == "subject") {
                    let fa = a.subject.toLowerCase(), fb = b.subject.toLowerCase();

                    if (fa < fb) {
                        return -1
                    }
                    if (fa > fb) {
                        return 1
                    }
                }
                else if (this.sortBy == 'location') {
                    let fa = a.location.toLowerCase(), fb = b.location.toLowerCase();

                    if (fa < fb) {
                        return -1
                    }
                    if (fa > fb) {
                        return 1
                    }
                }
                return 0
            })
            if (this.sortBy == 'price') {
                lessonOrder = lessonOrder.sort((a, b) => {
                    return a.price - b.price
                })
            }
            if (this.sortBy == 'availability') {
                lessonOrder = lessonOrder.sort((a, b) => {
                    return a.spaces - b.spaces
                })
            }
            if (this.orderBy !== "ascending") {
                lessonOrder.reverse()
            }
            if (this.searchValue != '' && this.searchValue) {
                lessonOrder = lessonOrder.filter((item) => {
                    return item.subject
                        .toUpperCase()
                        .includes(this.searchValue.toUpperCase())
                })
            }
            return lessonOrder
        },
    }
})
