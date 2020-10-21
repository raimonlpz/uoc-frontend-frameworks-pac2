/**
 * @class View
 *
 * Visual representation of the model.
 */
class UserView {
    constructor() {
      this.addEmployeeForm = this.getElement("#addEmployeeModal form");
      this.closeAddEmployee = this.getElement("#addEmployeeModal form button.close");
      this.cancelAddEmployee = this.getElement("#addEmployeeModal input.btn.btn-default");

      this.editEmployeeForm = this.getElement("#editEmployeeModal form");
      this.deleteEmployeeForm = this.getElement("#deleteEmployeeModal form");

      this.checkboxSelectAll = this.getElement("#selectAll");

      this.userList = this.createElement("tbody");
      this.table = this.getElement("table");
      this.table.append(this.userList);

      // pagination
      this.usersShowing = this.getElement("#usersShowing");
      this.usersTotal = this.getElement("#usersTotal");
      this.previousUsers = this.getElement("#previousUsers");
      this.nextUsers = this.getElement("#nextUsers");
      this.currentPageEl = this.getElement("#currentPage");
      this.currentPage = 0;
    }
  
    _resetForm() {
      for(let x=0; x<5; x++) {
        this.addEmployeeForm[x].value = "";
      }
    }
  
    createElement(tag, id) {
      const element = document.createElement(tag);
      if (id) element.id = id;
      return element;
    }
  
    getElement(selector) {
      const element = document.querySelector(selector);
      return element;
    }

    displayUsers(users) {
      while (this.userList.firstChild) {
        this.userList.removeChild(this.userList.firstChild);
      } 

      if(users.length === 0) {
        const p = this.createElement("p");
        p.className = 'placeholder';
        p.textContent = "No users in the DDBB";
        this.userList.append(p);

        this.usersShowing.innerHTML = 0;
        this.usersTotal.innerHTML = 0;
        this.currentPageEl.innerHTML = 1;

        this.previousUsers.parentElement.classList.add("disabled")
        this.nextUsers.parentElement.classList.add("disabled")

      } else {
        const totalUsers = JSON.parse(localStorage.getItem("users")).length;

        this.previousUsers.parentElement.classList.remove("disabled")
        this.nextUsers.parentElement.classList.remove("disabled")

        if(this.currentPage === 0) {
          this.previousUsers.parentElement.classList.add("disabled")
        }
        if((this.currentPage + 1) * 5 > totalUsers) {
          this.nextUsers.parentElement.classList.add("disabled")
        }

        this.usersShowing.innerHTML = users.length > 5 ? 5 : users.length;
        this.usersTotal.innerHTML = totalUsers;
        this.currentPageEl.innerHTML = this.currentPage + 1;

        users.map(user => {
          this.createUserRows(user);
        })
      } 
    }

    bindSetPagination(handler) {
      handler(this.currentPage);
      this.previousUsers.addEventListener("click", () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          handler(this.currentPage);
          this.checkboxSelectAll.checked = false;
        }
      });
      this.nextUsers.addEventListener("click", () => {
       if(JSON.parse(localStorage.getItem("users")).length > (this.currentPage + 1) * 5) {
        this.currentPage++;
        handler(this.currentPage);
        this.checkboxSelectAll.checked = false;
       }
      });
    }


    createUserRows(user) {
      const tr = this.createElement("tr");
      tr.id = user.id;

      const td_checkbox = this.createElement("td");
      const td_name = this.createElement("td");
      const td_email = this.createElement("td");
      const td_address = this.createElement("td");
      const td_phone = this.createElement("td");
      const td_actions = this.createElement("td");

      const span = this.createElement("span");
      span.classList.add("custom-checkbox");

      const checkbox = this.createElement("input", `checkbox-${user.id}`);
      checkbox.classList.add("checkbox");
      checkbox.checked = user.shouldBeDeleted ? true : false;
      checkbox.type = "checkbox";

      const label = this.createElement("label");
      label.htmlFor = `checkbox-${user.id}`;

      span.append(checkbox, label);
      td_checkbox.append(span);

      td_name.innerHTML = user.name;
      td_email.innerHTML = user.email;
      td_address.innerHTML = user.address;
      td_phone.innerHTML = user.phone;

      const a_edit = this.createActionSheet("edit", "&#xE254;");
      const a_delete = this.createActionSheet("delete", "&#xE872;");

      td_actions.append(a_edit, a_delete);
      tr.append(td_checkbox, td_name, td_email, td_address, td_phone, td_actions);
      this.userList.append(tr);
    }

    createActionSheet(action, icon) {
      const _action = this.createElement("a");
      _action.classList.add(action);
      _action.href = `#${action}EmployeeModal`;
      _action.dataset.toggle = "modal";

      const _icon = this.createElement("i");
      _icon.classList.add("material-icons");
      _icon.dataset.toggle = "tooltip";
      _icon.title = action.replace(action.charAt(0), action.charAt(0).toUpperCase());
      _icon.innerHTML = icon;

      _action.append(_icon);
      return _action;
    }


    bindAddUser(handler) {
      this.addEmployeeForm.addEventListener("submit", event => {
        event.preventDefault();
        let userSchema = {
          name: '',
          email: '',
          address: '',
          phone: '',
        };
        for(let x=0; x<4; x++) {
          userSchema[Object.keys(userSchema)[x]] = event.target[x + 1].value;
        }
        this.checkboxSelectAll.checked = false;
        handler(userSchema);
        this._resetForm();
        /* 
          to-do?: close modal when user submitted
        */
      });
      
      this.closeAddEmployee.addEventListener("click", () => {
        this._resetForm();
      })
      this.cancelAddEmployee.addEventListener("click", () => {
        this._resetForm();
      })    
    }


    bindDeleteUser(handler) {
      let id;
      this.userList.addEventListener("click", event => {
        const parentEl = event
                          .target.parentNode
                          .parentElement;
  
        if (event.target.parentNode.tagName === 'TD') {
          /* 
            small bug fix when user clicks nearly the delete icon and the 
            modal pops-up but the DOM don't retrieve back the id 
          */
            id = parentEl.id;
        } else if (event.target.parentNode.className === "delete") {
            id = parentEl
                  .previousSibling
                  .parentNode.attributes.id.value;
        }
      });

      this.deleteEmployeeForm.addEventListener("submit", event => {
        event.preventDefault();
        if(id) {
          handler(id);
          id = undefined;
          return;
        }

        const childs = this.userList.childNodes;
  
        if(childs[0].tagName !== 'P') {
          let ids = [];
          for(let x = 0; x < childs.length; x++) {
            /*
              to-do?: delete all users checked in all pages 
              (property shouldBeDeleted in localStorage -User- object). 
              not just ones in the current page looking at DOM
            */
            if(childs[x]
              .cells[0]
              .firstElementChild.children[0]
              .attributes[0].ownerElement.checked
            ) {
              let id = childs[x].attributes.id.value;
              ids.push(id);
            }
          }
          handler(ids);
        } 
      });
    }


    bindEditUser(handler) {
      let id;
      this.userList.addEventListener("click", event => {
          if (event.target.parentNode.className === "edit") {
            const parentEl = event
                              .target.parentNode
                              .parentElement.previousElementSibling
                              .parentElement;
                              
            id = parentEl.attributes.id.value;

            for(let x=1; x<5; x++) {
              this.editEmployeeForm[x].value = parentEl.childNodes[x].innerHTML;
            }
          }
      });

      this.editEmployeeForm.addEventListener("submit", event => {
        event.preventDefault();

        let userSchema = {
          name: '',
          email: '',
          address: '',
          phone: '',
        };

        for(let x=0; x<4; x++) {
          userSchema[Object.keys(userSchema)[x]] = event.target[x + 1].value;
        }
        this.checkboxSelectAll.checked = false;
        
        userSchema['id'] = id;
        handler(userSchema);
      });
    }


    bindToggleUser(handler) {
      this.userList.addEventListener("click", event => {
        if (event.target.type === 'checkbox') {
          const id = event.target.attributes.id.value.replace('checkbox-', '');

          if(!event.target.checked) {
            this.checkboxSelectAll.checked = false;
          }

          handler(id, event.target.checked);
        }
      });

      this.checkboxSelectAll.addEventListener("change", event => {
        let id;
        const childs = this.userList.childNodes;
        
        if (childs[0].tagName !== "P") {
          for(let x = 0; x < childs.length; x++) {
            childs[x].firstChild
                     .firstChild
                     .childNodes[0]
                     .checked = event.target.checked;

            id = childs[x].attributes.id.value;

            handler(id, event.target.checked);
          }
        } 
      });
    }
  }
  