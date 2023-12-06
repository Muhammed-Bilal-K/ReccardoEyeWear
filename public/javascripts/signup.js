<script>
                            $(document).ready(function () {

                                $.validator.addMethod("noSpace", function (value, element) {
                                    // Check if the value contains spaces
                                    return value.indexOf(" ") < 0;
                                }, "Spaces are not allowed in the password.");

                                // Add custom validation methods if needed
                                $.validator.addMethod("customEmail", function (value, element) {
                                    // Add your custom email validation logic here
                                    return /^[A-Za-z0-9]*[@](gmail)*[\.](com)$/.test(value);
                                }, "Invalid email format");

                                $.validator.addMethod("noSequenceDigits", function (value, element) {
                                    // Check if the value contains a sequence of three or more digits
                                    return !/(0{3,}|1{3,}|2{3,}|3{3,}|4{3,}|5{3,}|6{3,}|7{3,}|8{3,}|9{3,})/.test(value);
                                }, "Phone number should not contain a sequence of three or more digits.");

                                // Set up the form validation
                                $("#signupForm").validate({
                                    errorElement: 'span',
                                    errorClass: 'error-message',
                                    rules: {
                                        name: "required",
                                        // email: {
                                        //     required: true,
                                        //     email: true,
                                        //     customEmail: true // Use the custom email validation
                                        // },
                                        p_number: {
                                            required: true,
                                            minlength: 10,
                                            maxlength: 10,
                                            digits: true,
                                            noSequenceDigits: true,
                                        },
                                        password: {
                                            required: true,
                                            noSpace: true // Custom rule for no spaces
                                        },
                                        c_password: {
                                            required: true,
                                            equalTo: "#Password" // Ensure c_password matches the password
                                        }
                                    },
                                    messages: {
                                        name: "Please enter your name",
                                        email: {
                                            required: "Please enter your email",
                                            email: "Please enter a valid email address"
                                        },
                                        p_number: {
                                            required: "Please enter your phone number",
                                            minlength: "Please enter a 10-digit phone number",
                                            maxlength: "Please enter a 10-digit phone number",
                                            digits: "Please enter only digits",
                                            noSequenceDigits: "Phone number should not contain a sequence of three or more digits.",
                                        },
                                        password: {
                                            required: "Please enter your password",
                                            noSpace: "Spaces are not allowed in the password."
                                        },
                                        c_password: {
                                            required: "Please confirm your password",
                                            equalTo: "Passwords do not match"
                                        }
                                    },
                                    submitHandler: function (form) {
                                        form.submit();
                                        return false;
                                    }
                                });
                            });
                        </script>
                        
                        