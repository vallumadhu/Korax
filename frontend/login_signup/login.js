document.addEventListener('DOMContentLoaded', function(){
	const showLogin = document.getElementById('show-login');
	const showSignup = document.getElementById('show-signup');
	const loginForm = document.getElementById('login-form');
	const signupForm = document.getElementById('signup-form');
	const messageEl = document.getElementById('message');

	function setActive(tab){
		if(tab === 'login'){
			showLogin.classList.add('active');
			showSignup.classList.remove('active');
			loginForm.classList.remove('hidden');
			signupForm.classList.add('hidden');
		} else {
			showSignup.classList.add('active');
			showLogin.classList.remove('active');
			signupForm.classList.remove('hidden');
			loginForm.classList.add('hidden');
		}
		messageEl.textContent = '';
	}

	showLogin.addEventListener('click', () => setActive('login'));
	showSignup.addEventListener('click', () => setActive('signup'));

	// Show user-visible messages. Uses CSS classes to strictly follow theme colors.
	function showMessage(msg, isError){
		messageEl.textContent = msg;
		messageEl.classList.remove('success','error');
		if(isError){
			messageEl.classList.add('error');
		} else {
			messageEl.classList.add('success');
			setTimeout(()=> {
				messageEl.textContent = '';
				messageEl.classList.remove('success');
			}, 3500);
		}
	}

	loginForm.addEventListener('submit', function(e){
		e.preventDefault();
		const data = new FormData(loginForm);
		const email = data.get('email').trim();
		const pwd = data.get('password');
		if(!email || !pwd){
			showMessage('Please enter email and password', true);
			return;
		}
		// Placeholder: replace with real auth call
		showMessage('Signed in successfully');
		// Redirect to dashboard after short delay so user sees message
		setTimeout(()=>{
			window.location.href = '../dashboard/dashboard.html';
		}, 700);
		loginForm.reset();
	});

	signupForm.addEventListener('submit', function(e){
		e.preventDefault();
		const data = new FormData(signupForm);
		const name = data.get('name').trim();
		const email = data.get('email').trim();
		const pwd = data.get('password');
		const confirm = data.get('confirm');
		if(!name || !email || !pwd || !confirm){
			showMessage('Please fill all fields', true);
			return;
		}
		if(pwd !== confirm){
			showMessage('Passwords do not match', true);
			return;
		}
		// Placeholder: replace with real signup API call
		showMessage('Account created — signing you in...');
		// After signup, redirect to dashboard (or replace with login flow)
		setTimeout(()=>{
			window.location.href = '../dashboard/dashboard.html';
		}, 900);
		signupForm.reset();
	});
});

