
import fetch from "isomorphic-unfetch";
import React from "react";

import Slider from "../components/Slider";


export default class Index extends React.Component {
  static async getInitialProps(ctx) {
    const hostname = ctx && ctx.req ? ctx.req.headers.host.split(":")[0] : document.location.host;
    const protocol = ctx && ctx.req ? ctx.req.protocol : document.location.protocol.split(":")[0];

    const brandsResponse = await fetch(`${protocol}://${hostname}/api/brands`);
    const brands = await brandsResponse.json();

    const modelsResponse = await fetch(`${protocol}://${hostname}/api/models`);
    const models = await modelsResponse.json();

    const generationsResponse = await fetch(`${protocol}://${hostname}/api/generations`);
    const generations = await generationsResponse.json();

    const statsResponse = await fetch(`${protocol}://${hostname}/api/stats`);
    const stats = await statsResponse.json();

    return {
      brands,
      models,
      generations,
      stats,
    };
  }

  render() {
    return <ul>
      {
        this.props.brands.map(brand =>
          <li key={brand._id}>
            <h1>{brand.name}</h1>
            <ul>
              {
                this.props.models.filter(model => model.brand === brand.name).map(model =>
                  <li key={model._id}>
                    <h3>{model.name}</h3>
                    <Slider screenshots={this.props.generations.filter(generation => generation.model === model.name)} />
                  </li>
                )
              }
            </ul>
          </li>
        )
      }
    </ul>
  }
}