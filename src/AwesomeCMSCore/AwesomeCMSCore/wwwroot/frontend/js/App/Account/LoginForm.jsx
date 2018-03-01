import React, { Component } from "react";
import { render } from "react-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input
} from "reactstrap";
import toastr from "toastr";
import AwesomeInput from "../Common/AwesomeInput.jsx";
import axios from "axios";
import qs from "qs";
import { navigateToUrl } from "../Helper/util";
import env from "../Helper/envConfig";
import statusCode from "./../Helper/StatusCode";
import { setStorage } from "../Helper/storageHelper";
import { AppEnum } from "./../Helper/appEnum";

function validate(username, password) {
  // true means invalid, so our conditions got reversed
  return {
    username: username.length === 0,
    password: password.length === 0
  };
}

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      rememberMe: "",
      loading: false,
      canSubmit: false,
      touched: {
        username: false,
        password: false
      }
    };
  }

  canBeSubmitted() {
    const errors = validate(this.state.username, this.state.password);
    const isDisabled = Object.keys(errors).some(x => errors[x]);
    return !isDisabled;
  }

  login = e => {
    if (!this.canBeSubmitted()) {
      return;
    }

    e.preventDefault();

    axios
      .post(env.loginUrl, {
        Username: this.state.username,
        Password: this.state.password,
        RememberMe: this.state.rememberMe === "on" ? true : false
      })
      .then(res => {
        if (res.status === statusCode.Success) this.tokenRequest();

        if (res.status === statusCode.BadRequest)
          toastr.error("Invalid credentials");
      })
      .catch(function() {
        toastr.error("Invalid credentials");
      });
  };

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  onBlur(e) {
    this.setState({
      touched: { ...this.state.touched, [e.target.name]: true }
    });
  }

  tokenRequest() {
    axios
      .post(
        env.tokenUrl,
        qs.stringify({
          username: this.state.username,
          password: this.state.password,
          grant_type: "password",
          scope: "offline_access"
        })
      )
      .then(function(res) {
        let token = {
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token,
          token_type: res.data.token_type,
          expires_in: res.data.expires_in
        };
        setStorage(AppEnum.authToken, token);
        navigateToUrl(env.portal);
      });
  }

  render() {
    const errors = validate(this.state.username, this.state.password);
    const isDisabled = Object.keys(errors).some(x => errors[x]);

    const shouldMarkError = field => {
      const hasError = errors[field];
      const shouldShow = this.state.touched[field];

      return hasError ? shouldShow : false;
    };

    return (
      <Container>
        <Row>
          <Col md="12" id="loginContainer">
            <Form id="loginForm" onSubmit={this.login}>
              <div className="panel-heading">
                <h3 className="panel-title"> Admin portal </h3>
              </div>
              <div id="loginFormContent">
                <FormGroup>
                  <Label for="username" hidden>
                    Username
                  </Label>
                  <AwesomeInput
                    className={shouldMarkError("username")}
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    required="required"
                    value={this.state.username}
                    onChange={username => this.onChange(username)}
                    onBlur={username => this.onBlur(username)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="password" hidden>
                    Password
                  </Label>
                  <AwesomeInput
                    className={shouldMarkError("password")}
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    required="required"
                    value={this.state.password}
                    onChange={password => this.onChange(password)}
                    onBlur={password => this.onBlur(password)}
                  />
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      name="rememberMe"
                      onChange={rememberMe => this.onChange(rememberMe)}
                    />
                    Remember me ?
                  </Label>
                </FormGroup>
                <Button color="primary" type="submit" disabled={isDisabled}>
                  Login
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}

render(<LoginForm />, document.getElementById("loginForm"));