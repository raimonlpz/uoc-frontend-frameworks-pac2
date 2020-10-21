/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class UserController {
    constructor(service, view) {
      this.service = service;
      this.view = view;
  
      // Explicit this binding
      this.service.bindUserListChanged(this.onUserListChanged);
      this.view.bindAddUser(this.handleAddUser);
      this.view.bindEditUser(this.handleEditUser);
      this.view.bindDeleteUser(this.handleDeleteUser);
      this.view.bindToggleUser(this.handleToggleUser);
      this.view.bindSetPagination(this.handleSetPagination);
  
      // Display initial users
      this.onUserListChanged([...this.service.users].splice(0, 5));
    }
  
    onUserListChanged = users => {
      this.view.displayUsers(users);
    };
  
    handleAddUser = user => {
      this.service.addUser(user);
    };
  
    handleEditUser = user => {
      this.service.editUser(user);
    };
  
    handleDeleteUser = ids => {
      this.service.deleteUser(ids);
    };

    handleToggleUser = (id, isChecked) => {
      this.service.toggleUser(id, isChecked);
    };

    handleSetPagination = page => {
      this.service.setCurrentPage(page);
    }
}
  