console.log( 'jestAlert: js/system/components/operation/TaskManager.js loaded' );

//-------------------------
// TaskManager Class
//-------------------------
class TaskManager {
	// Properties
	duties			= [];			// [array] List of task objects or functions

	// Add tasks to the manager
	// * name      - [string] Unique name for the task
	// * task      - [function|object] Task to add
	// RETURNS: [bool] Success state
	employ( name, task ) {
		if ( typeof name!=='string' || !name.trim() ) {
			console.error( 'Task name must be a non-empty string.' );
			return false;
		}
		if ( typeof task!=='function' && typeof task!=='object' ) {
			console.error( 'Task must be a function or an object.' );
			return false;
		}
		this.duties[name] = task;
		return true;
	}

	// Deploy tasks
	// * Index		- [int] Start index (defaults to 0)
	// * count		- [int] Number of tasks to execute (defaults to all)
	// * wipe		- [bool] Whether to remove tasks after execution (defaults to true)
	// * args		- [array] Arguments to pass to tasks (optional)
	// RETURNS: [int] Remaining duties length
	deploy( index=0, count=null, wipe=true, args=[] ) {
		// Validate inputs
		if ( !Number.isInteger(index) ) index = 0;
		if ( !Number.isInteger(count) || count<1 ) count = this.duties.length - index;
		if ( !Array.isArray(args) ) args = [args];

		// Clamp index and count to valid ranges
		index = Math.max( 0, index );
		count = Math.min( count, this.duties.length-index );

		// Get the tasks to execute
		const tasksToExecute = this.duties.slice( index, index+count );

		// Execute tasks
		const cleanup = [];
		for ( let i=0; i<tasksToExecute.length; i++ ) {
			const task = tasksToExecute[i];
			if ( typeof task==='function' ) {
				// Execute the task with arguments
				task( ...args );
			}
			else {
				// Handle invalid tasks (could log errors here)
				console.warn( 'Invalid task found:', task );
			}
			// Mark for cleanup if wiping
			if ( wipe ) cleanup.push( i+index );
		}

		// Remove tasks if wiping
		if ( wipe ) {
			this.duties =
				this.duties.filter(
					( _, idx ) => {
						!cleanup.includes( idx );
					});
		}

		// Return the new length of duties
		return this.duties.length;
	}
}

//-------------------------
// Example Usage
//-------------------------

/*// Create a task manager
const manager = new TaskManager();

// Add tasks
manager.addDuties([
	() =>		console.log( "Task 1 executed" ),
	(name) =>	console.log( `Task 2 executed for ${name}` ),
	() =>		console.log( "Task 3 executed" ),
	]);

// Deploy tasks (execute all, wiping them)
manager.deploy(0, null, true, ["Alice"]);

// Add more tasks
manager.addDuties([
	() => console.log("New Task 1 executed"),
	() => console.log("New Task 2 executed"),
]);

// Deploy tasks without wiping
manager.deploy(0, 1, false);

// Remaining tasks
console.log("Remaining tasks:", manager.duties.length);*/
