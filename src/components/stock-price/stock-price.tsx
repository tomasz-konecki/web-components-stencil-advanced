import { Component, h, State, Element } from "@stencil/core/internal";

import { AV_API_KEY } from "../../global/global";

@Component({
  tag: "uc-stock-price",
  styleUrl: "./stock-price.css",
  shadow: true
})
export class StockPrice {
  stockInput: HTMLInputElement;

  // @Element() el: HTMLElement;
  @State() fetchedPrice: number;
  @State() stockUserInput: string;
  @State() stockInputValid = false;
  @State() error: string;

  onUserInput(e: Event) {
    this.stockUserInput = (e.target as HTMLInputElement).value;
    if (this.stockUserInput.trim() !== "") {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
  }

  onFetchStockPrice(event: Event) {
    event.preventDefault();

    // const stockSymbol = (this.el.shadowRoot.querySelector(
    //   "#stock-symbol"
    // ) as HTMLInputElement).value;

    const stockSymbol = this.stockInput.value;

    fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`
    )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Invalid!");
        }
        return res.json();
      })
      .then((parsedRes) => {
        if (!parsedRes["Global Quote"]["05. price"]) {
          throw new Error("Invalid symbol!");
        } else {
          this.error = null;
          this.fetchedPrice = +parsedRes["Global Quote"]["05. price"];
        }
      })
      .catch((err) => {
        this.fetchedPrice = null;
        this.error = err.message;
      });
  }

  render() {
    let dataContent = <p>Enter a symbol</p>;
    if (this.error) {
      dataContent = <p style={{ color: "red" }}>{this.error}</p>;
    }
    if (this.fetchedPrice) {
      dataContent = <p>Price: ${this.fetchedPrice}</p>;
    }
    return [
      <form onSubmit={this.onFetchStockPrice.bind(this)} autoComplete="off">
        <input
          id="stock-symbol"
          type="text"
          ref={(inp) => (this.stockInput = inp)}
          value={this.stockUserInput}
          onInput={this.onUserInput.bind(this)}
        />
        <button type="submit" disabled={!this.stockInputValid}>
          Fetch
        </button>
      </form>,
      <div>{dataContent}</div>
    ];
  }
}
