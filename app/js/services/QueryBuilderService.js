function QueryBuilderService(
  $resource,
  $http,
  AppSettings,
  NotificationService,
  $rootScope
) {
  "ngInject";

  const QUERY_ENDPOINT = `${AppSettings.api.baseUrl}${
    AppSettings.api.classifiers
  }/`;
  let USER_ENDPOINT = slug =>
    `${AppSettings.api.baseUrl}${AppSettings.api.users}/${slug}/`;
  const IGNORE_EXISTING_EMAIL = true;

  const service = {
    submitQuery: function(
      diseases = [],
      genes = [],
      user,
      email,
      isMailchimpOptIn
    ) {
      if (user === null || user === undefined) {
        NotificationService.notify({
          type: "error",
          message: `User is null or undefined.`
        });
        return;
      } else if (
        user.random_slugs === null ||
        user.random_slugs === undefined
      ) {
        NotificationService.notify({
          type: "error",
          message: `random_slugs is null or undefined.`
        });
        return;
      } else if (user.random_slugs.length < 1) {
        NotificationService.notify({
          type: "error",
          message: `random_slugs is empty.`
        });
        return;
      }

      let queryResource = $resource(
        QUERY_ENDPOINT,
        {},
        {
          submit: {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.random_slugs[0]}`
            }
          }
        }
      );

      function submitClassifier() {
        // parse diseases for just their acronyms
        diseases = diseases.map(diseaseObj => diseaseObj["acronym"]);
        // parse genes for just their entrezgene
        genes = genes.map(gene => gene["entrezgene"]);

        // Submit our query
        queryResource
          .submit({ diseases, genes, subscribe: isMailchimpOptIn })
          .$promise.then(
            res => {
              NotificationService.notify({
                type: "success",
                message: `<span class="material-icons" aria-hidden="true">check_circle</span> Classifier #${
                  res.id
                } submitted!`
              });
              $rootScope.$emit("MODAL_CLOSED");
              $rootScope.$emit("QUERY_SUBMITTED");
            },
            error => {
              console.log(error);
              NotificationService.notify({
                type: "error",
                message: `Failed to submit classifier. Error: ${error}`
              });
            }
          );
      }

      function executeSubmission(email) {
        if (
          user.email === null ||
          user.email === undefined ||
          IGNORE_EXISTING_EMAIL
        ) {
          // update email
          /*let email = prompt(
            "Enter your email address to receive your classifier:"
          );
*/
          function validateEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
          }

          if (validateEmail(email)) {
            // validation succeeded
            $http({
              method: "PUT",
              url: USER_ENDPOINT(user.random_slugs[0]),
              headers: {
                Authorization: `Bearer ${user.random_slugs[0]}`
              },
              data: {
                email: email
              }
            }).then(
              function successCallback() {
                submitClassifier();
              },
              function errorCallback(error) {
                console.log(error);
                NotificationService.notify({
                  type: "error",
                  message: `Failed to update email.`
                });
              }
            );
          } else {
            // validation failed
            NotificationService.notify({
              type: "error",
              message: "Please enter a valid email address."
            });
          }
        } else {
          submitClassifier();
        }
      }

      executeSubmission(email);
    }
  };

  return service;
}

export default {
  name: "QueryBuilderService",
  fn: QueryBuilderService
};
