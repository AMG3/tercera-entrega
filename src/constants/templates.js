export const welcomeMessageSubject = "Bienvenido";
export const welcomeMessageContent = `
<div>
    <p>Recibiste un mensaje bonito</p>
</div>
`;
export const checkoutTemplate = (order) => {
  const { cart, address, name } = order;
  const cartTemplate = buildCartItemsTemplate(cart);

  return `
        <h1>Nombre: ${name}</h1>
        <h2>Dirección: ${address}</h2>
        <div>
            ${cartTemplate}
        </div>
    `;
};

const buildCartItemsTemplate = (cart) => {
  let template = `
    <table>
        <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
        </tr>
  `;

  for (const item of Object.entries(cart.items)) {
    template += `
        <tr>
            <td>${item[1].item.description}</td>
            <td>${item[1].qty}</td>
            <td>${item[1].price}</td>
        </tr>
    `;
  }
  template += `
        <tr>
            <td><strong>TOTAL</strong></td>
            <td><strong>${cart.totalQty}</strong></td>
            <td><strong>${cart.totalPrice}</strong></td>
        </tr>
    </table>`;
  return template;
};
