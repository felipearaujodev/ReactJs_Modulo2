import React, { Component } from "react";
import api from "../../services/api";
import moment from "momemt";

import logo from "../../assets/logo.png";

import { Container, Form } from "./styles";
import CompareList from "../../components/CompareList";
import { Repository } from "../../components/CompareList/styles";

export default class Main extends Component {
  state = {
    repositoryInput: "",
    repositories: []
  };

  handleAddRepository = async event => {
    event.preventDefault(); //preventdefault desabilita o carregamento da página no submit

    try {
      const { data: repository } = await api.get(
        `/repos/${this.state.repositoryInput}`
      );

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      this.setState({
        repositoryInput: "",
        repositories: [...this.state.repositories, repository]
      });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <Container>
        <img src={logo} alt="Github Compare" />

        <Form onSubmit={this.handleAddRepository}>
          <input
            type="text"
            placeholder="usuário/repositório"
            value={this.state.repositoryInput}
            onChange={event =>
              this.setState({ repositoryInput: event.target.value })
            }
          />
          <button type="submit">OK</button>
        </Form>

        <CompareList repositories={this.state.repositories} />
      </Container>
    );
  }
}