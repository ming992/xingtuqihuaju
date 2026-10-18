/* Integration boundary: replace these methods with a trusted server implementation. */
window.STAR_COMMERCE={
  mode:'demo',
  async createOrder(){throw new Error('演示模式：未接入订单服务，未发起支付。')},
  async redeemCode(){throw new Error('演示模式：未接入兑换码服务。')},
  async getMembership(){return {active:false,mode:'demo'}}
};
