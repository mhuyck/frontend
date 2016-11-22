const DiseaseCardComponent = {
    templateUrl: 'diseaseCard/diseaseCard.tpl.html',
    bindings: {
      id: '@',
      samples: '=',
      positives: '@',
      negatives: '@'
    },
    controller: ['$log',function($log) {
            'ngInject';
             $log = $log.getInstance('DiseaseCardComponent', true);
             $log.log(`${this.id}`);
              
        }]
}

export default {
	name: 'diseaseCard',
	obj: DiseaseCardComponent
};
