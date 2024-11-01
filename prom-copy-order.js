// Code for Chrome extention
// User JavaScript and CSS
// https://chrome.google.com/webstore/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld

// Code for URL
// https://my.prom.ua/

setTimeout(function() {
	// copy button
	const copy_button = create_copy_order_button()
	copy_button.onclick = function () {
		// check url path
		if (!/order\/edit/.test(location.pathname)) return alert('Перейди на страницу заказа')
		
		//order to clipboard
		const order_data = copy_order_data()
		const cb = navigator.clipboard
		cb.writeText(JSON.stringify(order_data)).then(() => alert('Скопировано'))
	}
	
	// highlight button
	const highlight_button = create_highlight_orders_button()
	highlight_button.onclick = function () {
		navigator.clipboard.readText().then(clipText => {
			const ordersID_list = JSON.parse(clipText)
			//console.log(ordersID_list)
			highlight_orders(ordersID_list)
		})
	}
	
	// add buttons
	const buttons_block = create_buttons_block()
	buttons_block.appendChild(copy_button)
	buttons_block.appendChild(highlight_button)
	document.body.prepend(buttons_block)	
}, 2000)


function create_buttons_block () {
	const buttons_block = document.createElement('div')
	buttons_block.setAttribute('style', 'position: fixed; z-index: 9999; left: 50%; transform: translateX(-50%);')
	return buttons_block
}

function create_copy_order_button () {
	const copy_button = document.createElement('button')
	const copy_button_text = document.createTextNode("Скопировать информацию о заказе")
	copy_button.appendChild(copy_button_text)
	copy_button.setAttribute('style', 'margin: 10px;')
	return copy_button
}

function create_highlight_orders_button () {
	const highlight_button = document.createElement('button')
	const highlight_button_text = document.createTextNode("Выделить заказы которых нет в Appsheet")
	highlight_button.appendChild(highlight_button_text)
	highlight_button.setAttribute('style', 'margin: 10px;')
	return highlight_button
}

function copy_order_data() {
	let order = {
		id: "",
		date: "",
		status: "To Do",
		payment: "",
		order_referer: "prom",
		sale_total: "",
		client: {
			full_name: "",
			phone: ""
		},
		delivery: {
			//name: "",
			address: "",
			tracking_number: ""
		},
		comments: "",
		products: [] // [{name: "", quantity: "", price: "", image_url: ""}]
	}
	
	// get id
	order.id = document.querySelector('.qa_order_id').textContent.substring(1)
	
	// get date
	order.date = document.querySelector('.b-order-edit__time').textContent.match(/\d{2}\.\d{2}\.\d{4}/)[0]
	
	// get payment
	if ( document.querySelector('.PaymentDropdown__dropDownText--3i53m') && /Наложенный платеж/i.test(document.querySelector('.PaymentDropdown__dropDownText--3i53m').textContent) ) order.payment = 'postpay'
	else if ( document.querySelector('.PaymentDropdown__dropDownText--3i53m') && /Оплата по реквизитам или наличными|Оплата картой|WayForPay/i.test(document.querySelector('.PaymentDropdown__dropDownText--3i53m').textContent) ) order.payment = 'prepay'
	
	// get sale_total
	order.sale_total = parseFloat(document.querySelector('[data-qaid="total_order_sum"]').textContent.slice(0, -4))
	
	// get comments
	order.comments = document.querySelector('[data-qaid="client_comment"]').textContent
	
	// get carrier
	//const delivery_name = document.querySelector('[data-qaid="delivery_name"]').textContent
	//if (/Нова Пошта/i.test(delivery_name)) order.delivery_name = delivery_name
	
	const delivery_block_rows = document.querySelectorAll('.b-order-edit-table-delivery__row')
	for (let i=0; i < delivery_block_rows.length; i++) {
		const row = delivery_block_rows[i]
		const left_cell = row.querySelectorAll('.b-order-edit-table-delivery__cell')[1].dataset.qaid
		const right_cell = row.querySelectorAll('.b-order-edit-table-delivery__cell')[1].innerText.trim()
		
		// get tracking number
		if (/Номер накладной/i.test(left_cell)) order.delivery.tracking_number = right_cell
		// get client full name
		else if (/Получатель/i.test(left_cell)) order.client.full_name = right_cell
		// get clien phone
		else if (/Телефон получателя/i.test(left_cell)) order.client.phone = right_cell
		// get address
		else if (/Адрес/i.test(left_cell)) order.delivery.address = right_cell
	}
	
	// ukrposhta extract phone number
	if (!order.client.phone && /\+38/.test(order.client.full_name)) order.client.phone = order.client.full_name.slice(order.client.full_name.match(/\+38/).index)
	
	// get products
	const product_rows = document.querySelectorAll('[data-qaid="about_order_block"] .b-order-edit-table__row')
	for (let p=0; p < product_rows.length; p++) {
		let product = {}
		product.name = product_rows[p].querySelector('[data-qaid="product_link"]').innerText
		product.price = parseFloat(parseFloat(product_rows[p].querySelector('[data-qaid="product_price"]').innerText.slice(0, -4)))
		if (product_rows[p].querySelector('[data-qaid="quantity_input"]')) product.quantity = parseFloat(product_rows[p].querySelector('[data-qaid="quantity_input"]').value)
		else if (product_rows[p].querySelector('.b-order-edit-table__quantity')) product.quantity = parseFloat(product_rows[p].querySelector('.b-order-edit-table__quantity').textContent)
		order.products.push(product)
	}
	
	console.log(order)
	return order
}

function highlight_orders(ordersID_list) {
	const orders_list = document.querySelectorAll('[data-qaid="order_id"]')
	for (let i=0; i < orders_list.length; i++) {
		if ( !ordersID_list.includes(orders_list[i].textContent) ) orders_list[i].setAttribute('style', 'background-color: #fff200; padding: 10px;')
	}
}