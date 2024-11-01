// Code for Chrome extention
// User JavaScript and CSS
// https://chrome.google.com/webstore/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld

// Code for URL
// https://my.synthetic.ua/

setTimeout(function() {
	// copy button
	const copy_button = create_copy_order_button()
	copy_button.onclick = function () {
		// check url path
		if (!document.querySelector('.ant-drawer-open')) return alert('Открой страницу заказа')
		
		//order to clipboard
		const order_data = copy_order_data()
		console.log(order_data)
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
		order_referer: "synthetic",
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
	order.id = document.querySelector('.custom-title').textContent.trim().match(/SM\d+/)[0]

	// get date
	order.date = document.querySelector('.ant-steps-item-description').textContent.match(/\d{2}\.\d{2}\.\d{2}/)[0]
	
	const order_attributes = document.querySelectorAll('.order-attribute')
	for (let i=0; i < order_attributes.length; i++) {
		const row = order_attributes[i]
		const left_cell = row.querySelector('.order-attribute__label').textContent.trim()
		const right_cell = row.querySelector('.order-attribute__value').textContent.trim()
		
		// get full name
		// get phone
		if (/Отримувач/i.test(left_cell)) {
			const [full_name, phone] = right_cell.split(',')
			order.client.full_name = full_name.trim()
			order.client.phone = phone.trim()
			console.log(order.client.full_name, order.client.phone)
		}
		
		// get payment
		else if (/Спосіб оплати/i.test(left_cell)) {
			if ( /Наложений платіж/i.test(right_cell) ) order.payment = 'postpay'
			else if ( /Переказ на картку|Безготівковий/i.test(right_cell) ) order.payment = 'prepay'				
		}
		
		// get carrier
		else if (/Метод доставки/i.test(left_cell)) order.delivery.address += right_cell
		
		// get address
		else if (/Адреса доставки/i.test(left_cell)) order.delivery.address += ' ' + right_cell
		
		// get comments
		else if (/Коментар/i.test(left_cell)) order.comments += right_cell + '\n'
	}
	
	// get sale total and bonuses
	let [sale, bonuses] = document.querySelector('.order-products__price').textContent.replaceAll(/\s|грн/g, '').split('+')
	sale *= 1 // to Number
	bonuses *=1 // to Number
	
	order.sale_total = bonuses ? sale + bonuses : sale
	
	if (bonuses && bonuses > 0) order.comments += `${sale}${order.payment == 'postpay' ? ' наложка' : ''} + ${bonuses} бонусы` + '\n'
	
	
	// get products
	const product_rows = document.querySelectorAll('.order-products__product')
	for (let p=0; p < product_rows.length; p++) {
		let product = {}
		product.name = product_rows[p].querySelector('.order-products__product-name').textContent.trim()
		product.price = parseFloat(product_rows[p].querySelectorAll('.order-products__column')[2].textContent.trim())
		product.quantity = parseFloat(product_rows[p].querySelectorAll('.order-products__column')[1].textContent.trim())
		order.products.push(product)
	}
	
	return order
}

function highlight_orders(ordersID_list) {
	const orders_list = document.querySelectorAll('.ant-table-tbody')[0].querySelectorAll('.ant-table-row.ant-table-row-level-0 td:nth-child(2)')
	for (let i=0; i < orders_list.length; i++) {
		if ( !ordersID_list.includes(orders_list[i].textContent) ) orders_list[i].setAttribute('style', 'background-color: #fff200; padding: 10px;')
	}
}