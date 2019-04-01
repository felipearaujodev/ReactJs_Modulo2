import React, { Component } from "react";
import api from "../../services/api";
import moment from "moment";

import logo from "../../assets/logo.png";

import { Container, Form } from "./styles";
import CompareList from "../../components/CompareList";

export default class Main extends Component {
  state = {
    loading: false,
    updateLoad: false,
    repositoryError: false,
    repositoryInput: "",
    repositories: []
  };

  async componentDidMount() {
    this.setState({ loading: true, updateLoad: true });

    this.setState({
      loading: false,
      updateLoad: false,
      repositories: await this.getLocalRepositories()
    });
  }

  handleAddRepository = async event => {
    event.preventDefault(); //preventdefault desabilita o carregamento da página no submit

    this.setState({ loading: true });
    try {
      const { data: repository } = await api.get(
        `/repos/${this.state.repositoryInput}`
      );

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      this.setState({
        repositoryInput: "",
        repositories: [...this.state.repositories, repository],
        repositoryError: false
      });

      const localRepositories = await this.getLocalRepositories();

      await localStorage.setItem(
        "ls_repositories:repositories",
        JSON.stringify([...localRepositories, repository])
      );
    } catch (error) {
      this.setState({ repositoryError: true });
      alert("Repositório Inválido!!");
    } finally {
      this.setState({ loading: false });
    }
  };

  getLocalRepositories = async () =>
    JSON.parse(await localStorage.getItem("ls_repositories:repositories")) ||
    [];

  handleRemoveRepository = async id => {
    const { repositories } = this.state;

    const updatedRepositories = repositories.filter(
      repository => repository.id !== id
    );

    this.setState({ repositories: updatedRepositories });

    await localStorage.setItem(
      "ls_repositories:repositories",
      JSON.stringify(updatedRepositories)
    );
  };

  handleUpdateRepository = async id => {
    this.setState({ updateLoad: true });
    const { repositories } = this.state;

    const repository = repositories.find(repo => repo.id === id);

    try {
      const { data } = await api.get(`/repos/${repository.full_name}`);

      console.log(data);

      data.lastCommit = moment(data.pushed_at).fromNow();

      this.setState({
        repositoryError: false,
        repositoryInput: "",
        repositories: repositories.map(repo =>
          repo.id === data.id ? data : repo
        )
      });

      await localStorage.setItem(
        "ls_repositories:repositories",
        JSON.stringify(repositories)
      );

      this.setState({ updateLoad: false });
    } catch (err) {
      this.setState({ repositoryError: true });
      this.setState({ updateLoad: false });
    }
  };

  render() {
    return (
      <Container>
        <img src={logo} alt="Github Compare" />

        <Form
          withError={this.state.repositoryError}
          onSubmit={this.handleAddRepository}
        >
          <input
            type="text"
            placeholder="usuário/repositório"
            value={this.state.repositoryInput}
            onChange={event =>
              this.setState({ repositoryInput: event.target.value })
            }
          />
          <button type="submit">
            {this.state.loading ? (
              <i className="fa fa-spinner fa-pulse" />
            ) : (
              "OK"
            )}
          </button>
        </Form>

        <CompareList
          repositories={this.state.repositories}
          removeItem={this.handleRemoveRepository}
          updateItem={this.handleUpdateRepository}
        />
      </Container>
    );
  }
}
