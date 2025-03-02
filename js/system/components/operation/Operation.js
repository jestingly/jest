console.log( 'jestAlert: js/system/components/operation/Operation.js loaded' );

//-------------------------
// EngineOperation Class
//-------------------------
class Operation extends OSCallback {
	// Properties
	cycles			= [];				// [array] List of cycles in the operation
	duration		= 1;				// [int] Total number of cycles
	auto			= true;				// [bool] Whether the operation auto-starts
	volley			= null;				// [Int] How many callbacks to fire each execution (null = all)
	cycle			= -1;				// [int] Current cycle index

	//-------------------------
	// Constructor
	//-------------------------
	// * config    - [object] Configuration object
	constructor( config={} ) {
		this.auto		= config.auto ?? true;
		this.cycles		= config.cycles ?? [];
		this.duration	= config.duration ?? this.cycles.length || 1;
		this.volley		= config.volley ?? null;
	}

	//-------------------------
	// Utility Methods
	//-------------------------
	// Increase or decrease the duration and adjust cycles
	// * count     - [int] Number of cycles to add or remove
	// * newCycles - [array] New cycles to add (optional)
	// RETURNS: [bool] Success state
	adjustDuration( count=1, newCycles=[] ) {
		if ( count<0 ) {
			this.cycles = this.cycles.slice( 0, Math.max(0,this.cycles.length+count) );
		}
		else {
			this.cycles.push( ...newCycles.slice(0,count) );
		}
		this.duration = this.cycles.length;
		return true;
	}

	//-------------------------
	// Operation Methods
	//-------------------------
	// Start the operation
	// * autoboost		- [bool] Whether to auto boost
	// RETURNS: [bool] Success state
	start( autoboost=false ) {
		// Require status to be in idle to switch to operate
		let status	= this.getMode( 'status' );
		if ( status==='idle' ) {
			this.setMode( 'status', 'operating' );
			this.cycle = 0;
			console.log( 'Operation started.' );
			this.emit( 'kickoff' ); // attempt kickoff errand
			if ( autoboost ) this.boost(); // Autoboost if set to
			return true;
		}
		console.warn( 'Operation is already running.' );
		return false;
	}

	// Increment the operation
	// * job		- [string] Name of the job (default: 'process')
	// * data		- [object] Optional configuration data
	// RETURNS: [bool] Success state
	boost( job='process', data={} ) {
		// Require status to be operating
		let status	= this.getMode( 'status' );
		if ( status!=='operating' ) {
			console.error( 'Cannot boost operation in state:', this.state );
			return false;
		}
		if ( this.cycle<this.duration ) {
			console.log( `Boosting job '${job}' at cycle ${this.cycle + 1}/${this.duration}.` );
			this.cycle++;
			// Task execution
			this.executeJob( job, this.cycle, data );
		}
		else this.finish(); // finish operation
		return true;
	}

	// Execute a specific job
	// * job		- [string] Job name
	// * cycle		- [int] Current cycle
	// * data		- [object] Data for the job
	// RETURNS: [void]
	executeJob( job, cycle, data ) {
		console.log( `Executing job '${job}' for cycle ${cycle}.`, data );
		// Implement job logic as needed
		this.emit( job, this.volley ); // attempt job
	}

	// Finish the operation
	// RETURNS: [void]
	finish() {
		console.log( 'Operation completed.' );
		this.setMode( 'status', 'idle' );
		this.cycle = -1;
	}
}
