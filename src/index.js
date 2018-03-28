import ReactDOM from "react-dom";
import React, { Component } from "react";
import "./index.css";
//import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
import ReactTable from "react-table";
import "react-table/react-table.css";

//add the endpoint for our GraphQL server to the uri property of the client config object
const client1 = new ApolloClient({
  uri: "https://w5xlvm3vzz.lp.gql.zone/graphql" //currency exchange example
});
const client2 = new ApolloClient({
  uri: `https://nx9zvp49q7.lp.gql.zone/graphql` //dog example
});

class App extends Component {
  render() {
    return (
      <div>
        <ExchangeApp />
        <DogApp />
        {/* <ReactTable
        // data={}
        // columns={}
        /> */}
      </div>
    );
  }
}

/* =============================== Simply Retrieving Data from GraphQL server: =============================== */
class ExchangeApp extends Component {
  render() {
    return (
      <ApolloProvider client={client1}>
        <div style={{ padding: "20px" }}>
          <h2>Retrieving Data</h2>
          <ExchangeRates />
        </div>
      </ApolloProvider>
    );
  }
}
const ExchangeRates = () => (
  <Query
    query={gql`
      {
        rates(currency: "USD") {
          currency
          rate
        }
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) {
        return <p>Error :(</p>;
      }
      return (
        <ReactTable
          data={data.rates}
          columns={[
            {
              Header: "Currency",
              accessor: "currency" // String-based value accessors!
            },
            {
              Header: "Rate",
              accessor: "rate" // String-based value accessors!
            }
          ]}
        />
      );
      // return data.rates.map(({ currency, rate }) => (
      //   <div key={currency}>
      //     <p>{`${currency}: ${rate}`}</p>
      //   </div>
      // ));
    }}
  </Query>
);

/* =============================== Querying & polling/fetching GraphQL data: =============================== */
class DogApp extends Component {
  state = { selectedDog: null };

  onDogSelected = ({ target }) => {
    this.setState(() => ({ selectedDog: target.value }));
  };

  render() {
    return (
      <ApolloProvider client={client2}>
        <div style={{ padding: "20px" }}>
          <h2>Building Query components</h2>
          {this.state.selectedDog && (
            <DogPhoto breed={this.state.selectedDog} />
          )}
          <Dogs onDogSelected={this.onDogSelected} />
        </div>
      </ApolloProvider>
    );
  }
}
/* 
  Building query components to fetch graphql data
  https://www.apollographql.com/docs/react/essentials/queries.html
    * Apollo Client queries are just standard GraphQL
    * The Query component is one of the most important building blocks of your Apollo application
    * To create a Query component, just pass a GraphQL query string wrapped with the gql function to this.props.query
      and provide a function to this.props.children that tells React what to render
*/
const GET_DOGS = gql`
  {
    dogs {
      id
      breed
    }
  }
`;
const Dogs = ({ onDogSelected }) => (
  <Query query={GET_DOGS}>
    {({ loading, error, data }) => {
      if (loading) return "Loading...";
      if (error) return `Error! ${error.message}`;
      console.log(this.props);
      return (
        <select name="dog" onChange={onDogSelected}>
          {data.dogs.map(dog => (
            <option key={dog.id} value={dog.breed}>
              {dog.breed}
            </option>
          ))}
        </select>
      );
    }}
  </Query>
);
/*
  Apollo caching example
    * DogPhoto accepts a prop called breed that reflects the current value of our form from the Dogs component above.
*/
const GET_DOG_PHOTO = gql`
  query dog($breed: String!) {
    dog(breed: $breed) {
      id
      displayImage
    }
  }
`;

//DogPhoto component accepts a prop called breed that reflects the current value of our form from the Dogs component above.
// - The prop variables is an object containing the variables we want to pass to our GraphQL query. In this case, we want to pass the breed from the form into our query.
const DogPhoto = ({ breed }) => (
  <Query query={GET_DOG_PHOTO} variables={{ breed }}>
    {({ loading, error, data }) => {
      if (loading) return null;
      if (error) return `Error!: ${error}`;

      return (
        <img
          src={data.dog.displayImage}
          alt="dog"
          style={{ height: 100, width: 100 }}
        />
      );
    }}
  </Query>
);

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
